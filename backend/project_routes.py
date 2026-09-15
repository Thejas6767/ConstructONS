"""Project routes — customer view + admin management.
Phase 3: Drawings & Approvals Engine with Revision Control & Notifications.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta
import uuid
import time
import asyncio

from db import db
from auth import require_admin
from customer_auth import get_current_customer

proj_router = APIRouter(prefix="/api", tags=["projects"])

IST = timezone(timedelta(hours=5, minutes=30))

def _ist_today() -> str:
    return datetime.now(IST).date().isoformat()

# 🛡️ SECURITY: Simple In-Memory Rate Limiter
_RATE_LIMITS = {}

def apply_rate_limit(request: Request, limit: int = 5, window_sec: int = 60):
    ip = request.client.host
    path = request.url.path
    key = f"{ip}:{path}"
    now = time.time()
    
    if key not in _RATE_LIMITS:
        _RATE_LIMITS[key] = []
        
    _RATE_LIMITS[key] = [t for t in _RATE_LIMITS[key] if now - t < window_sec]
    
    if len(_RATE_LIMITS[key]) >= limit:
        raise HTTPException(status_code=429, detail="Too many requests. Please wait a minute and try again.")
        
    _RATE_LIMITS[key].append(now)

# 🛡️ SECURITY: Role-Based Access Control (RBAC) Enforcer
def _enforce_full_access(proj: dict, user_email: str):
    if proj.get("customer_email", "").lower() == user_email:
        return True
    for member in proj.get("team_directory", []):
        if member.get("email", "").lower() == user_email:
            if member.get("access") == "Full Access":
                return True
            break
    raise HTTPException(status_code=403, detail="Security Action Blocked: You require 'Full Access' permissions to perform this action.")


DEFAULT_STAGES = [
    ("Discovery", "Understanding your brief, budget, style and site."),
    ("Design", "Floor plans, 3D elevations and interior direction approved."),
    ("Approvals", "Municipal sanctions, permits and utility clearances."),
    ("Booking", "Contract signed and advance payment received."),
    ("Site Preparation", "Excavation, marking and levelling on your plot."),
    ("Foundation", "Footings, plinth beams and DPC waterproofing."),
    ("Structure", "RCC columns, beams and slabs for every floor."),
    ("Walls & MEP", "Masonry, electrical, plumbing rough-ins."),
    ("Finishing", "Plaster, paint, flooring, joinery and interiors."),
    ("Handover", "Snags fixed, cleaning done, keys and documents handed over."),
]

def _default_stage_list() -> List[Dict[str, Any]]:
    return [{
        "index": i,
        "name": name,
        "description": desc,
        "status": "pending",
        "started_at": None,
        "completed_at": None,
        "expected_date": None,
        "progress_pct": 0,
        "photos": [],
        "documents": [],
        "notes": "",
    } for i, (name, desc) in enumerate(DEFAULT_STAGES)]

async def _log_activity(project_id: str, user_name: str, action: str, module: str):
    await db.projects.update_one(
        {"id": project_id, "$or": [{"activities": {"$exists": False}}, {"activities": None}]},
        {"$set": {"activities": []}}
    )
    activity = {
        "id": str(uuid.uuid4()),
        "user_name": user_name,
        "action": action,
        "module": module,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await db.projects.update_one(
        {"id": project_id},
        {"$push": {"activities": {"$each": [activity], "$slice": -100}}},
    )

async def _push_notification(project_id: str, title: str, message: str, link: str, icon_type: str = "general"):
    """Pushes an in-app notification to the project's notification feed."""
    await db.projects.update_one(
        {"id": project_id, "$or": [{"notifications": {"$exists": False}}, {"notifications": None}]},
        {"$set": {"notifications": []}}
    )
    notif = {
        "id": str(uuid.uuid4()),
        "title": title,
        "message": message,
        "link": link,
        "icon": icon_type,  
        "is_read": False,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await db.projects.update_one(
        {"id": project_id},
        {"$push": {"notifications": {"$each": [notif], "$slice": -50, "$sort": {"timestamp": -1}}}},
    )


# ---------------- Schemas ----------------
class ProjectCreateBody(BaseModel):
    customer_email: str
    customer_name: Optional[str] = None
    title: str = "My Home Project"
    address: Optional[str] = None
    package_slug: Optional[str] = None
    quote_id: Optional[str] = None
    contract_value: Optional[float] = 0
    amount_spent: Optional[float] = 0
    cover_image: Optional[str] = None
    team_ids: Optional[List[str]] = Field(default_factory=list)

class StagePatchBody(BaseModel):
    status: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    expected_date: Optional[str] = None
    progress_pct: Optional[float] = None
    photos: Optional[List[str]] = None
    documents: Optional[List[Dict[str, Any]]] = None
    notes: Optional[str] = None

class ProjectUpdateBody(BaseModel):
    title: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = None
    package_slug: Optional[str] = None
    quote_id: Optional[str] = None
    contract_value: Optional[float] = None
    amount_spent: Optional[float] = None
    cover_image: Optional[str] = None
    team_ids: Optional[List[str]] = None
    documents: Optional[List[Dict[str, Any]]] = None
    cctv_cameras: Optional[List[Dict[str, Any]]] = None

class TeamInviteBody(BaseModel):
    name: Optional[str] = ""
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str
    access: str = "View Access"
    company: Optional[str] = ""
    contact: Optional[str] = None

class AttendanceBody(BaseModel):
    member_ids: List[str] = Field(default_factory=list)

class NotificationMarkReadBody(BaseModel):
    notification_id: str

# New Drawings Schemas
class DrawingCreateBody(BaseModel):
    name: str
    category: str  # Architectural, Structural, Electrical, Plumbing, Interior
    url: str

class DrawingRevisionBody(BaseModel):
    url: str

class DrawingDecisionBody(BaseModel):
    decision: str  # 'approved', 'rejected', 'changes_required'
    comment: Optional[str] = None


async def _build_unified_team(proj: dict) -> List[Dict[str, Any]]:
    unified: List[Dict[str, Any]] = []
    team_ids = proj.get("team_ids") or []
    if team_ids:
        docs = await db.team_members.find({"id": {"$in": team_ids}, "is_published": True}, {"_id": 0}).to_list(100)
        id_map = {d["id"]: d for d in docs}
        for tid in team_ids:
            if tid in id_map:
                m = id_map[tid]
                unified.append({
                    "id": m["id"],
                    "name": m.get("name"),
                    "email": None,
                    "role": m.get("designation") or m.get("role") or "Staff",
                    "company": "ConstructONS",
                    "contact": m.get("phone") or m.get("whatsapp") or "",
                    "access": "Full Access",
                    "status": "Active",
                    "photo": m.get("photo"),
                    "whatsapp": m.get("whatsapp") or m.get("phone"),
                    "bio": m.get("bio"),
                    "linkedin": m.get("linkedin"),
                    "is_core": True,
                })

    for ext in proj.get("team_directory") or []:
        unified.append({
            "id": ext.get("id"),
            "name": ext.get("name"),
            "email": ext.get("email"),
            "role": ext.get("role"),
            "company": ext.get("company") or "—",
            "contact": ext.get("contact") or "",
            "access": ext.get("access") or "View Access",
            "status": ext.get("status") or "Pending",
            "photo": ext.get("avatar"),
            "whatsapp": ext.get("contact"),
            "bio": None,
            "linkedin": None,
            "is_core": False,
        })
    return unified


async def _auto_activate_pending_user(project_id: str, email: str, name: str):
    proj = await db.projects.find_one({"id": project_id}, {"team_directory": 1})
    if not proj:
        return
    directory = proj.get("team_directory") or []
    updated = False
    activated_role = ""
    for item in directory:
        if item.get("email") and item.get("email").lower() == email.lower() and item.get("status") == "Pending":
            item["status"] = "Active"
            if name and not item.get("name"):
                item["name"] = name
            updated = True
            activated_role = item.get("role") or "Team Member"
    if updated:
        await db.projects.update_one({"id": project_id}, {"$set": {"team_directory": directory}})
        await _log_activity(project_id, name or email, f"{name or email} joined the project as {activated_role}", "Team")


# ============================================================================
# ---------------- Customer Portal Endpoints ----------------
# ============================================================================

@proj_router.get("/portal/my-projects-list")
async def portal_my_projects_list(customer=Depends(get_current_customer)):
    email = (customer.get("email") or "").lower()
    if not email:
        return {"projects": []}
    cursor = db.projects.find(
        {"$or": [{"customer_email": email}, {"team_directory.email": email}]},
        {"id": 1, "title": 1, "project_code": 1, "address": 1, "cover_image": 1, "customer_email": 1, "team_directory": 1, "updated_at": 1}
    ).sort("updated_at", -1)
    projects = await cursor.to_list(100)
    out = []
    for p in projects:
        role = "Project Owner" if p.get("customer_email") == email else "Guest"
        for t in p.get("team_directory", []):
            if t.get("email") == email:
                role = t.get("role") or role
                break
        out.append({
            "id": p["id"],
            "title": p.get("title") or "Unnamed Project",
            "project_code": p.get("project_code"),
            "address": p.get("address"),
            "cover_image": p.get("cover_image"),
            "user_role": role
        })
    return {"projects": out}


@proj_router.get("/portal/my-project")
async def portal_my_project(project_id: Optional[str] = None, customer=Depends(get_current_customer)):
    email = (customer.get("email") or "").lower()
    name = customer.get("name") or ""
    if not email:
        raise HTTPException(status_code=404, detail="No user email found")

    query = {"$or": [{"customer_email": email}, {"team_directory.email": email}]}
    if project_id:
        query["id"] = project_id

    proj = await db.projects.find_one(query, {"_id": 0}, sort=[("updated_at", -1)])
    if not proj:
        return {"project": None}

    await _auto_activate_pending_user(proj["id"], email, name)
    proj["team"] = await _build_unified_team(proj)
    
    # Calculate unread notifications and pending approvals counts for UI
    notifs = proj.get("notifications") or []
    drawings = proj.get("drawings") or []
    proj["unread_notifications"] = len([n for n in notifs if not n.get("is_read")])
    proj["pending_approvals"] = len([d for d in drawings if d.get("status") == "pending"])
    
    return {"project": proj}


@proj_router.get("/portal/my-project/team-data")
async def portal_team_data(project_id: Optional[str] = None, customer=Depends(get_current_customer)):
    email = (customer.get("email") or "").lower()
    name = customer.get("name") or ""
    query = {"$or": [{"customer_email": email}, {"team_directory.email": email}]}
    if project_id:
        query["id"] = project_id

    proj = await db.projects.find_one(
        query,
        {"_id": 0, "id": 1, "customer_email": 1, "team_ids": 1, "team_directory": 1, "activities": 1, "attendance": 1, "title": 1},
        sort=[("updated_at", -1)]
    )
    if not proj:
        raise HTTPException(status_code=404, detail="No project found")

    await _auto_activate_pending_user(proj["id"], email, name)
    members = await _build_unified_team(proj)

    today = _ist_today()
    attendance = sorted(proj.get("attendance") or [], key=lambda a: a.get("date", ""), reverse=True)
    today_entry = next((a for a in attendance if a.get("date") == today), None)
    on_site_ids = set((today_entry or {}).get("member_ids") or [])

    for m in members:
        m["on_site"] = m["id"] in on_site_ids

    kpis = {
        "total_members": len(members),
        "on_site_today": len(on_site_ids),
        "contractors": sum(1 for t in members if "contractor" in str(t.get("role", "")).lower()),
        "consultants": sum(1 for t in members if any(k in str(t.get("role", "")).lower() for k in ("consultant", "architect", "designer"))),
        "clients": sum(1 for t in members if any(k in str(t.get("role", "")).lower() for k in ("owner", "client", "spouse", "family"))),
        "pending_invites": sum(1 for t in members if t.get("status") == "Pending"),
    }
    
    activities = proj.get("activities") or []
    activities.sort(key=lambda x: x.get("timestamp") or "", reverse=True)

    return {
        "kpis": kpis,
        "team_members": members,
        "activities": activities,
        "attendance": attendance[:7],
        "on_site_ids": list(on_site_ids),
        "date_today": today,
    }


@proj_router.post("/portal/my-project/team/invite")
async def portal_invite_team_member(request: Request, body: TeamInviteBody, customer=Depends(get_current_customer)):
    apply_rate_limit(request, limit=5, window_sec=60)
    email = (customer.get("email") or "").lower()
    proj = await db.projects.find_one(
        {"$or": [{"customer_email": email}, {"team_directory.email": email}]},
        {"id": 1, "title": 1, "customer_email": 1, "team_directory": 1}
    )
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    _enforce_full_access(proj, email)

    contact = (body.phone or body.contact or "").strip()
    invitee_email = (body.email or "").lower().strip()
    if not invitee_email:
        raise HTTPException(status_code=400, detail="Google Email is required for authentication")

    status = "Active" if invitee_email == email else "Pending"
    new_member = {
        "id": f"usr_{uuid.uuid4().hex[:12]}",
        "name": (body.name or "").strip() or invitee_email.split("@")[0],
        "email": invitee_email,
        "phone": contact,
        "role": body.role,
        "company": (body.company or "Family").strip(),
        "contact": contact,
        "access": body.access,
        "status": status,
        "avatar": None,
        "invited_at": datetime.now(timezone.utc).isoformat(),
    }

    existing = await db.projects.find_one(
        {"id": proj["id"], "team_directory.email": invitee_email},
        {"_id": 1},
    )
    if existing:
        raise HTTPException(status_code=409, detail="This email has already been added to the project team")

    await db.projects.update_one({"id": proj["id"]}, {"$push": {"team_directory": new_member}})
    await _log_activity(proj["id"], customer.get("name") or "Project Owner", f"Invited {new_member['name']} ({invitee_email}) as {new_member['role']}", "Team")
    return {"success": True, "member": new_member, "project_title": proj.get("title")}


@proj_router.delete("/portal/my-project/team/{member_id}")
async def portal_remove_invited_team_member(request: Request, member_id: str, customer=Depends(get_current_customer)):
    apply_rate_limit(request, limit=10, window_sec=60)
    email = (customer.get("email") or "").lower()
    proj = await db.projects.find_one(
        {"$or": [{"customer_email": email}, {"team_directory.email": email}]},
        {"id": 1, "customer_email": 1, "team_directory": 1}
    )
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    _enforce_full_access(proj, email)
    primary_owner_email = (proj.get("customer_email") or "").lower()
    is_primary_owner = (email == primary_owner_email)

    target = next((m for m in proj.get("team_directory", []) if m.get("id") == member_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Member not found or is a core staff member assigned by Admin")

    target_email = (target.get("email") or "").lower()
    if target_email == primary_owner_email:
        raise HTTPException(status_code=400, detail="The Primary Project Owner cannot be removed.")
    if target_email == email:
        raise HTTPException(status_code=400, detail="You cannot remove yourself. Please ask the Primary Owner or Admin.")
    if not is_primary_owner and target.get("access") == "Full Access":
        raise HTTPException(status_code=403, detail="Only the Primary Project Owner can remove Co-Owners and Full Access members.")

    await db.projects.update_one({"id": proj["id"]}, {"$pull": {"team_directory": {"id": member_id}}})
    await _log_activity(proj["id"], customer.get("name") or "Client", f"Removed {target.get('name')} ({target.get('role')}) from project", "Team")
    return {"success": True}


@proj_router.patch("/portal/my-project/notifications/read")
async def portal_mark_notification_read(body: NotificationMarkReadBody, customer=Depends(get_current_customer)):
    email = (customer.get("email") or "").lower()
    proj = await db.projects.find_one(
        {"$or": [{"customer_email": email}, {"team_directory.email": email}]},
        {"id": 1, "notifications": 1}
    )
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
        
    await db.projects.update_one(
        {"id": proj["id"], "notifications.id": body.notification_id},
        {"$set": {"notifications.$.is_read": True}}
    )
    return {"success": True}


# ============================================================================
# ---------------- Drawings & Approvals Endpoints ----------------
# ============================================================================

@proj_router.post("/portal/my-project/drawings/{drawing_id}/decision")
async def portal_submit_drawing_decision(drawing_id: str, body: DrawingDecisionBody, customer=Depends(get_current_customer)):
    """Client approves, rejects, or requests changes on a specific drawing."""
    email = (customer.get("email") or "").lower()
    
    # Must have Edit or Full Access to approve drawings
    proj = await db.projects.find_one(
        {"$or": [{"customer_email": email}, {"team_directory.email": email}]},
        {"id": 1, "customer_email": 1, "team_directory": 1, "drawings": 1}
    )
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Check if they have permission to approve (must be Primary Owner or Full/Edit access)
    is_primary = proj.get("customer_email") == email
    if not is_primary:
        allowed = False
        for m in proj.get("team_directory", []):
            if m.get("email") == email and m.get("access") in ["Full Access", "Edit Access"]:
                allowed = True
                break
        if not allowed:
            raise HTTPException(status_code=403, detail="You do not have permission to approve drawings.")

    drawings = proj.get("drawings") or []
    drawing_idx = next((i for i, d in enumerate(drawings) if d["id"] == drawing_id), -1)
    if drawing_idx == -1:
        raise HTTPException(status_code=404, detail="Drawing not found")

    drawing = drawings[drawing_idx]
    if drawing["status"] != "pending":
        raise HTTPException(status_code=400, detail="This drawing is not pending an approval.")

    # Update latest version with decision
    now = datetime.now(timezone.utc).isoformat()
    latest_version_idx = len(drawing["versions"]) - 1
    
    drawing["versions"][latest_version_idx]["client_decision"] = body.decision
    drawing["versions"][latest_version_idx]["client_comment"] = body.comment
    drawing["versions"][latest_version_idx]["decided_at"] = now
    
    drawing["status"] = body.decision  # 'approved', 'rejected', or 'changes_required'

    await db.projects.update_one(
        {"id": proj["id"]},
        {"$set": {f"drawings.{drawing_idx}": drawing, "updated_at": now}}
    )

    action_text = "Approved" if body.decision == "approved" else "Rejected" if body.decision == "rejected" else "Requested Changes on"
    await _log_activity(proj["id"], customer.get("name") or "Client", f"{action_text} drawing: {drawing['name']}", "Drawings")

    return {"success": True, "status": body.decision}


@proj_router.post("/admin/projects/{project_id}/drawings", dependencies=[Depends(require_admin)])
async def create_drawing(project_id: str, body: DrawingCreateBody):
    """Admin uploads a completely new drawing."""
    p = await db.projects.find_one({"id": project_id}, {"id": 1, "drawings": 1})
    if not p:
        raise HTTPException(status_code=404, detail="Not found")

    await db.projects.update_one(
        {"id": project_id, "$or": [{"drawings": {"$exists": False}}, {"drawings": None}]},
        {"$set": {"drawings": []}}
    )

    now = datetime.now(timezone.utc).isoformat()
    drawing = {
        "id": f"dwg_{uuid.uuid4().hex[:10]}",
        "name": body.name.strip(),
        "category": body.category,
        "current_version": 1,
        "status": "pending",
        "uploaded_at": now,
        "uploaded_by": "Admin",
        "versions": [{
            "version": 1,
            "url": body.url,
            "uploaded_at": now,
            "client_decision": None,
            "client_comment": None,
            "decided_at": None
        }]
    }

    await db.projects.update_one(
        {"id": project_id},
        {"$push": {"drawings": {"$each": [drawing], "$position": 0}}, "$set": {"updated_at": now}}
    )

    await _log_activity(project_id, "Admin", f"Uploaded new drawing for approval: {body.name}", "Drawings")
    asyncio.create_task(_push_notification(project_id, "Action Required: Drawing Approval", f"Please review and approve the new {body.category} drawing: {body.name}.", "/portal/approvals", "system"))

    return {"success": True, "drawing": drawing}


@proj_router.post("/admin/projects/{project_id}/drawings/{drawing_id}/revision", dependencies=[Depends(require_admin)])
async def revise_drawing(project_id: str, drawing_id: str, body: DrawingRevisionBody):
    """Admin uploads a new version of an existing drawing after client requests changes."""
    p = await db.projects.find_one({"id": project_id}, {"id": 1, "drawings": 1})
    if not p:
        raise HTTPException(status_code=404, detail="Not found")

    drawings = p.get("drawings") or []
    drawing_idx = next((i for i, d in enumerate(drawings) if d["id"] == drawing_id), -1)
    if drawing_idx == -1:
        raise HTTPException(status_code=404, detail="Drawing not found")

    drawing = drawings[drawing_idx]
    
    # Must only revise if the current status is NOT pending
    if drawing["status"] == "pending":
        raise HTTPException(status_code=400, detail="Cannot upload revision while current version is still pending client approval.")

    now = datetime.now(timezone.utc).isoformat()
    new_version_num = drawing["current_version"] + 1

    revision = {
        "version": new_version_num,
        "url": body.url,
        "uploaded_at": now,
        "client_decision": None,
        "client_comment": None,
        "decided_at": None
    }

    drawing["versions"].append(revision)
    drawing["current_version"] = new_version_num
    drawing["status"] = "pending"
    drawing["uploaded_at"] = now

    await db.projects.update_one(
        {"id": project_id},
        {"$set": {f"drawings.{drawing_idx}": drawing, "updated_at": now}}
    )

    await _log_activity(project_id, "Admin", f"Uploaded Revision V{new_version_num} for {drawing['name']}", "Drawings")
    asyncio.create_task(_push_notification(project_id, "Action Required: Drawing Revision", f"A revised version of {drawing['name']} is ready for your review.", "/portal/approvals", "system"))

    return {"success": True, "drawing": drawing}


@proj_router.delete("/admin/projects/{project_id}/drawings/{drawing_id}", dependencies=[Depends(require_admin)])
async def delete_drawing(project_id: str, drawing_id: str):
    p = await db.projects.find_one({"id": project_id}, {"id": 1, "drawings": 1})
    if not p:
        raise HTTPException(status_code=404, detail="Not found")

    drawings = p.get("drawings") or []
    target = next((d for d in drawings if d["id"] == drawing_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Drawing not found")

    await db.projects.update_one(
        {"id": project_id},
        {"$pull": {"drawings": {"id": drawing_id}}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    await _log_activity(project_id, "Admin", f"Deleted drawing: {target['name']}", "Drawings")
    return {"success": True}


# ============================================================================
# ---------------- Admin CRUD ----------------
# ============================================================================

@proj_router.get("/admin/projects", dependencies=[Depends(require_admin)])
async def list_projects(q: Optional[str] = None):
    query: Dict[str, Any] = {}
    if q:
        query["$or"] = [
            {"customer_email": {"$regex": q, "$options": "i"}},
            {"customer_name": {"$regex": q, "$options": "i"}},
            {"title": {"$regex": q, "$options": "i"}},
        ]
    docs = await db.projects.find(query, {"_id": 0}).sort("created_at", -1).limit(500).to_list(500)
    return docs


@proj_router.get("/admin/projects/{project_id}", dependencies=[Depends(require_admin)])
async def get_project(project_id: str):
    p = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    return p


@proj_router.patch("/admin/projects/{project_id}/attendance", dependencies=[Depends(require_admin)])
async def set_attendance(project_id: str, body: AttendanceBody):
    p = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Not found")

    today = _ist_today()

    await db.projects.update_one(
        {"id": project_id, "$or": [{"attendance": {"$exists": False}}, {"attendance": None}]},
        {"$set": {"attendance": []}}
    )

    await db.projects.update_one({"id": project_id}, {"$pull": {"attendance": {"date": today}}})

    entry = {
        "date": today,
        "member_ids": body.member_ids,
        "count": len(body.member_ids),
        "marked_at": datetime.now(timezone.utc).isoformat(),
        "marked_by": "Admin",
    }
    await db.projects.update_one(
        {"id": project_id},
        {"$push": {"attendance": {"$each": [entry], "$slice": -30}}},
    )
    
    await _log_activity(project_id, "Site Admin", f"Attendance marked: {len(body.member_ids)} member(s) on site", "Attendance")
    
    # 🔔 TRIGGER ALERT
    asyncio.create_task(_push_notification(project_id, "Daily Site Update", f"{len(body.member_ids)} members checked in on site today.", "/portal/team", "attendance"))

    return {"success": True, "date": today, "on_site": len(body.member_ids)}


@proj_router.post("/admin/projects", dependencies=[Depends(require_admin)])
async def create_project(body: ProjectCreateBody):
    email = body.customer_email.lower().strip()
    if not email:
        raise HTTPException(status_code=400, detail="customer_email required")
    existing = await db.projects.find_one({"customer_email": email}, {"id": 1})
    if existing:
        raise HTTPException(status_code=409, detail="Project already exists for this customer")

    now = datetime.now(timezone.utc).isoformat()
    count = await db.projects.count_documents({})
    proj_code = f"CON-{datetime.now(timezone.utc).year}-{(count + 1):04d}"

    owner_name = body.customer_name or email.split("@")[0]
    owner_record = {
        "id": f"usr_{uuid.uuid4().hex[:12]}",
        "name": owner_name,
        "email": email,
        "role": "Project Owner",
        "company": "Home Owner",
        "contact": "",
        "access": "Full Access",
        "status": "Active",
        "avatar": None,
    }
    init_activity = {
        "id": str(uuid.uuid4()),
        "user_name": "System Admin",
        "action": "Project initialized",
        "module": "System",
        "timestamp": now,
    }
    init_notif = {
        "id": str(uuid.uuid4()),
        "title": "Project Created",
        "message": f"Welcome to {body.title}! Your digital home tracker is active.",
        "link": "/portal",
        "icon": "system",
        "is_read": False,
        "timestamp": now
    }

    doc = {
        "id": str(uuid.uuid4()),
        "project_code": proj_code,
        "customer_email": email,
        "customer_name": owner_name,
        "title": body.title,
        "address": body.address,
        "package_slug": body.package_slug,
        "quote_id": body.quote_id,
        "status": "active",
        "stages": _default_stage_list(),
        "contract_value": body.contract_value or 0,
        "amount_spent": body.amount_spent or 0,
        "cover_image": body.cover_image,
        "team_ids": body.team_ids or [],
        "team_directory": [owner_record],
        "activities": [init_activity],
        "notifications": [init_notif],
        "drawings": [],
        "attendance": [],
        "documents": [],
        "cctv_cameras": [],
        "created_at": now,
        "updated_at": now,
    }
    await db.projects.insert_one(doc)
    doc.pop("_id", None)
    return doc


@proj_router.put("/admin/projects/{project_id}", dependencies=[Depends(require_admin)])
async def update_project(project_id: str, body: ProjectUpdateBody):
    upd = {k: v for k, v in body.model_dump().items() if v is not None}
    upd["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    if body.team_ids is not None:
        await _log_activity(project_id, "System Admin", "Updated internal team assignments", "Team")
        if len(body.team_ids) > 0:
            asyncio.create_task(_push_notification(project_id, "Team Update", "New staff members have been assigned to your project.", "/portal/team", "team"))

    res = await db.projects.update_one({"id": project_id}, {"$set": upd})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return await db.projects.find_one({"id": project_id}, {"_id": 0})


@proj_router.patch("/admin/projects/{project_id}/stages/{index}", dependencies=[Depends(require_admin)])
async def patch_stage(project_id: str, index: int, body: StagePatchBody):
    p = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    stages = p.get("stages") or []
    if index < 0 or index >= len(stages):
        raise HTTPException(status_code=400, detail="Invalid stage index")
    stage = stages[index]
    patch = body.model_dump(exclude_unset=True)

    status_changed_to_started = (patch.get("status") == "in_progress" and stage.get("status") != "in_progress")
    status_changed_to_completed = (patch.get("status") == "completed" and stage.get("status") != "completed")
    new_photos_added = (patch.get("photos") is not None and len(patch.get("photos")) > len(stage.get("photos") or []))

    if patch.get("status") == "in_progress" and not stage.get("started_at"):
        patch["started_at"] = datetime.now(timezone.utc).isoformat()
        
    if patch.get("status") == "completed" and not stage.get("completed_at"):
        patch["completed_at"] = datetime.now(timezone.utc).isoformat()
        patch["progress_pct"] = 100

    stage.update(patch)
    stages[index] = stage
    
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {"stages": stages, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    
    # Notifications
    if status_changed_to_started:
        await _log_activity(project_id, "Site Engineer", f"Started stage: {stage['name']}", "Progress")
    if status_changed_to_completed:
        await _log_activity(project_id, "Site Engineer", f"Completed stage: {stage['name']}", "Progress")
        asyncio.create_task(_push_notification(project_id, "Milestone Achieved!", f"Stage {stage['name']} has been completed.", "/portal/timeline", "progress"))
    if new_photos_added:
        await _log_activity(project_id, "Site Engineer", f"Uploaded new photos for {stage['name']}", "Progress")
        asyncio.create_task(_push_notification(project_id, "New Site Photos", f"Fresh progress photos uploaded for {stage['name']}.", "/portal/timeline", "progress"))

    return stage


@proj_router.delete("/admin/projects/{project_id}", dependencies=[Depends(require_admin)])
async def delete_project(project_id: str):
    res = await db.projects.delete_one({"id": project_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"success": True}
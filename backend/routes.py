from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File, Form, Response, Header, Request
from fastapi.responses import Response as FastAPIResponse
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timezone
import logging

from db import db, serialize_doc
from auth import (
    require_admin, verify_admin_credentials, create_admin_token,
    set_admin_cookie, clear_admin_cookie, COOKIE_NAME,
)
from models import (
    Home, Package, Testimonial, FAQ, Blog, MarketplaceCategory,
    FinancialService, TeamMember, AIPlatformModule, JourneyStep,
    HeroSection, MediaItem, ComparisonRow, StatItem, SiteSettings,
    Lead, LeadCreate, QuizSubmission, Proposal, CustomQuote, QuoteTemplate,
    InteriorLibraryItem, now_iso, new_id
)

from customer_auth import (
    GoogleAuthBody, process_google_auth, get_current_customer,
    logout_customer as _logout_customer, CustomerProfileUpdate,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")


# ----------------------- helpers -----------------------
async def list_docs(collection: str, published_only: bool = True, sort_field: str = "sort_order"):
    q = {}
    if published_only:
        q["is_published"] = True
    docs = await db[collection].find(q, {"_id": 0}).sort(sort_field, 1).to_list(1000)
    return docs

async def get_doc(collection: str, id_or_slug: str, key: str = "id"):
    doc = await db[collection].find_one({key: id_or_slug}, {"_id": 0})
    if not doc:
        doc = await db[collection].find_one({"slug": id_or_slug}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail=f"{collection} not found")
    return doc

async def upsert_doc(collection: str, doc: Dict[str, Any]):
    doc["updated_at"] = now_iso()
    if not doc.get("id"):
        doc["id"] = new_id()
        doc["created_at"] = now_iso()
    await db[collection].update_one({"id": doc["id"]}, {"$set": doc}, upsert=True)
    return doc

async def delete_doc(collection: str, id: str):
    result = await db[collection].delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"success": True}


# ----------------------- Auth (Admin) -----------------------
class AdminLoginReq(BaseModel):
    email: str
    password: str

@router.post("/admin/login")
async def admin_login(body: AdminLoginReq, response: FastAPIResponse):
    if not await verify_admin_credentials(body.email, body.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_admin_token(body.email)
    set_admin_cookie(response, token)
    return {"token": token, "email": body.email, "role": "admin"}


@router.post("/admin/logout")
async def admin_logout(response: FastAPIResponse):
    clear_admin_cookie(response)
    return {"success": True}


@router.get("/admin/me")
async def admin_me(user=Depends(require_admin)):
    return user


@router.post("/admin/reseed", dependencies=[Depends(require_admin)])
async def admin_reseed():
    from seed import seed_all
    await seed_all()
    counts = {}
    for coll in [
        "homes", "packages", "hero_sections", "site_settings",
        "financial_services", "marketplace_categories", "ai_modules",
        "comparison", "stats", "journey_steps", "testimonials",
        "faqs", "blogs", "team_members", "media",
    ]:
        counts[coll] = await db[coll].count_documents({})
    return {"success": True, "counts": counts}


# ============================================================================
# Customer Auth & Profile Settings
# ============================================================================
from customer_auth import (
    GoogleAuthBody, process_google_auth, get_current_customer,
    logout_customer as _logout_customer, CustomerProfileUpdate
)

@router.post("/customer/auth/google")
async def customer_process_google(body: GoogleAuthBody, response: FastAPIResponse):
    """Authenticate customer directly using Google ID token credential."""
    return await process_google_auth(body, response)


@router.get("/customer/me")
async def customer_me(customer=Depends(get_current_customer)):
    """Retrieve full identity & onboarding status of logged in customer."""
    return customer


@router.put("/customer/profile")
async def update_customer_profile(body: CustomerProfileUpdate, customer=Depends(get_current_customer)):
    """Allows client to complete onboarding or update profile settings."""
    update_data = {k: v for k, v in body.model_dump().items() if v is not None}
    if not update_data:
        return {"success": True, "customer": customer}

    update_data["updated_at"] = now_iso()

    await db.customers.update_one(
        {"user_id": customer["user_id"]},
        {"$set": update_data}
    )
    updated_customer = await db.customers.find_one({"user_id": customer["user_id"]}, {"_id": 0})
    return {"success": True, "customer": updated_customer}


@router.post("/customer/logout")
async def customer_logout(request: Request, response: FastAPIResponse):
    """Logout customer session."""
    return await _logout_customer(request, response)


# ============================================================================
# Admin CRM: Registered Client Users Directory
# ============================================================================
@router.get("/admin/customers", dependencies=[Depends(require_admin)])
async def list_registered_customers(q: Optional[str] = None):
    """Admin endpoint to view all onboarded clients and their project requirements."""
    query: Dict[str, Any] = {}
    if q:
        query["$or"] = [
            {"email": {"$regex": q, "$options": "i"}},
            {"name": {"$regex": q, "$options": "i"}},
            {"phone": {"$regex": q, "$options": "i"}},
            {"plot_location": {"$regex": q, "$options": "i"}},
        ]
    docs = await db.customers.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs


@router.get("/admin/customers/{user_id}", dependencies=[Depends(require_admin)])
async def get_customer_details(user_id: str):
    """Admin view of a single customer profile."""
    doc = await db.customers.find_one({"user_id": user_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Customer not found")
    return doc

# ----------------------- Homes -----------------------
@router.get("/homes")
async def list_homes():
    return await list_docs("homes")

@router.get("/homes/{id_or_slug}")
async def get_home(id_or_slug: str):
    return await get_doc("homes", id_or_slug)

@router.post("/homes", dependencies=[Depends(require_admin)])
async def create_home(body: Home):
    return await upsert_doc("homes", body.model_dump())

@router.put("/homes/{id}", dependencies=[Depends(require_admin)])
async def update_home(id: str, body: Home):
    data = body.model_dump()
    data["id"] = id
    return await upsert_doc("homes", data)

@router.delete("/homes/{id}", dependencies=[Depends(require_admin)])
async def del_home(id: str):
    return await delete_doc("homes", id)


# ----------------------- Packages -----------------------
@router.get("/packages")
async def list_packages():
    return await list_docs("packages")

@router.get("/packages/{id_or_slug}")
async def get_package(id_or_slug: str):
    return await get_doc("packages", id_or_slug)

@router.post("/packages", dependencies=[Depends(require_admin)])
async def create_package(body: Package):
    return await upsert_doc("packages", body.model_dump())

@router.put("/packages/{id}", dependencies=[Depends(require_admin)])
async def update_package(id: str, body: Package):
    await _snapshot_package(id, note="edit")
    data = body.model_dump()
    data["id"] = id
    return await upsert_doc("packages", data)

@router.delete("/packages/{id}", dependencies=[Depends(require_admin)])
async def del_package(id: str):
    await _snapshot_package(id, note="pre-delete")
    return await delete_doc("packages", id)


# ----------------------- Packages: Compare + Brochure -----------------------
@router.get("/packages-compare")
async def packages_compare():
    pkgs = await db.packages.find({"is_published": True}, {"_id": 0}).sort("sort_order", 1).to_list(100)
    cat_order = []
    seen = set()
    for p in pkgs:
        for c in (p.get("spec_categories") or []):
            n = c.get("name")
            if n and n not in seen:
                cat_order.append(n)
                seen.add(n)
    return {"packages": pkgs, "category_order": cat_order}


@router.get("/packages/{slug}/brochure.pdf")
async def download_brochure(slug: str):
    pkg = await db.packages.find_one({"slug": slug}, {"_id": 0})
    if not pkg:
        pkg = await db.packages.find_one({"id": slug}, {"_id": 0})
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0}) or {}

    from brochure import generate_brochure
    pdf_bytes = generate_brochure(pkg, settings)
    filename = f"ConstructONS-{pkg.get('slug','package')}-brochure.pdf"
    return FastAPIResponse(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{filename}"',
            "Cache-Control": "public, max-age=300",
        },
    )


class PersonalizedBrochureRequest(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    city: Optional[str] = None
    message: Optional[str] = None
    save_lead: bool = True
    quiz_submission_id: Optional[str] = None


@router.post("/packages/{slug}/brochure")
async def personalized_brochure(slug: str, body: PersonalizedBrochureRequest):
    pkg = await db.packages.find_one({"slug": slug}, {"_id": 0})
    if not pkg:
        pkg = await db.packages.find_one({"id": slug}, {"_id": 0})
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0}) or {}

    year = datetime.now(timezone.utc).strftime("%y")
    lead_count = await db.leads.count_documents({})
    seq = str(lead_count + 1).zfill(4)
    tier_code = (pkg.get("tier") or pkg.get("slug", "pkg"))[:4].upper()
    quote_ref = f"CONS-{year}-{tier_code}-{seq}"

    lead_id = None
    if body.save_lead:
        lead = Lead(
            name=body.name,
            phone=body.phone,
            email=body.email,
            city=body.city,
            message=body.message or f"Requested personalised brochure ({pkg.get('name')})",
            interested_package=pkg.get("name"),
            source="brochure_download",
            quote_ref=quote_ref,
            quiz_submission_id=body.quiz_submission_id,
        )
        lead_doc = lead.model_dump()
        await db.leads.insert_one(lead_doc)
        lead_id = lead.id

    if body.quiz_submission_id:
        await db.quiz_submissions.update_one(
            {"id": body.quiz_submission_id},
            {"$set": {
                "converted_to_lead_id": lead_id,
                "contact_name": body.name,
                "contact_phone": body.phone,
                "contact_email": body.email,
                "contact_city": body.city,
                "status": "converted" if lead_id else "contact_captured",
                "updated_at": now_iso(),
            }},
        )

    personalization = {
        "customer_name": body.name,
        "quote_ref": quote_ref,
        "customer_city": body.city,
    }

    from brochure import generate_brochure
    pdf_bytes = generate_brochure(pkg, settings, personalization=personalization)
    filename = f"ConstructONS-{pkg.get('slug','package')}-{quote_ref}.pdf"
    return FastAPIResponse(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Quote-Ref": quote_ref,
            "Access-Control-Expose-Headers": "X-Quote-Ref, Content-Disposition",
        },
    )


# ----------------------- Package Recommender -----------------------
class RecommendRequest(BaseModel):
    budget: str
    family_size: str
    style: Optional[str] = None
    smart_home: str = "no"


@router.post("/recommend")
async def recommend_package(body: RecommendRequest):
    packages = await db.packages.find({"is_published": True}, {"_id": 0}).sort("sort_order", 1).to_list(20)
    homes = await db.homes.find({"is_published": True}, {"_id": 0}).sort("sort_order", 1).to_list(50)

    budget_map = {
        "value": "basic",
        "balanced": "essential",
        "premium": "standard",
        "luxury": "premium",
    }
    smart_map = {"no": "basic", "basic": "standard", "full": "premium"}
    ideal_by_budget = budget_map.get(body.budget, "essential")
    ideal_by_smart = smart_map.get(body.smart_home, "essential")

    tier_order = {"basic": 1, "essential": 2, "standard": 3, "premium": 4}
    ideal_score = max(tier_order.get(ideal_by_budget, 2), tier_order.get(ideal_by_smart, 2))

    scored = []
    for p in packages:
        tier = p.get("tier", "basic")
        tscore = tier_order.get(tier, 1)
        diff = abs(tscore - ideal_score)
        base = 100 - diff * 30
        if tier == ideal_by_budget:
            base += 10
        scored.append((base, p))

    scored.sort(key=lambda x: -x[0])
    best = scored[0][1]

    def bhk_min(fs):
        if fs == "1-2": return 2
        if fs == "3-4": return 3
        if fs == "5+": return 4
        return 2

    needed_bhk = bhk_min(body.family_size)

    def home_matches(h):
        pkg_names = [pc.lower() for pc in (h.get("package_compatibility") or [])]
        if best.get("tier") and best["tier"] not in pkg_names and best.get("name", "").split()[0].lower() not in pkg_names:
            return False
        if (h.get("bedrooms") or 0) < needed_bhk:
            return False
        if body.style and body.style != "any":
            if (h.get("style") or "").lower() != body.style.lower():
                return False
        return True

    shortlist = [h for h in homes if home_matches(h)]
    if not shortlist:
        shortlist = [h for h in homes if (h.get("bedrooms") or 0) >= needed_bhk]
    shortlist = shortlist[:3]

    submission = QuizSubmission(
        budget=body.budget,
        family_size=body.family_size,
        style=body.style,
        smart_home=body.smart_home,
        recommended_package_slug=best.get("slug"),
        recommended_package_name=best.get("name"),
        shortlisted_home_slugs=[h.get("slug") for h in shortlist if h.get("slug")],
        shortlisted_home_names=[h.get("name") for h in shortlist if h.get("name")],
        score=scored[0][0],
        source="quiz",
    )
    await db.quiz_submissions.insert_one(submission.model_dump())

    return {
        "recommended_package": best,
        "shortlisted_homes": shortlist,
        "score": scored[0][0],
        "alternatives": [s[1] for s in scored[1:3]],
        "submission_id": submission.id,
    }


# ----------------------- Quiz Submissions -----------------------
class QuizSubmissionUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    contact_city: Optional[str] = None


@router.get("/quiz-submissions", dependencies=[Depends(require_admin)])
async def list_quiz_submissions(status: Optional[str] = None):
    q = {}
    if status:
        q["status"] = status
    docs = await db.quiz_submissions.find(q, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs


@router.get("/quiz-submissions/{id}", dependencies=[Depends(require_admin)])
async def get_quiz_submission(id: str):
    doc = await db.quiz_submissions.find_one({"id": id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    return doc


@router.put("/quiz-submissions/{id}", dependencies=[Depends(require_admin)])
async def update_quiz_submission(id: str, body: QuizSubmissionUpdate):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    update["updated_at"] = now_iso()
    result = await db.quiz_submissions.update_one({"id": id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"success": True}


@router.delete("/quiz-submissions/{id}", dependencies=[Depends(require_admin)])
async def del_quiz_submission(id: str):
    return await delete_doc("quiz_submissions", id)


# ----------------------- Real-time notifications -----------------------
@router.get("/notifications/pending", dependencies=[Depends(require_admin)])
async def notifications_pending(since: Optional[str] = None):
    from datetime import timedelta
    if since:
        try:
            since_dt = datetime.fromisoformat(since.replace("Z", "+00:00"))
        except Exception:
            since_dt = datetime.now(timezone.utc) - timedelta(hours=24)
    else:
        since_dt = datetime.now(timezone.utc) - timedelta(hours=24)
    since_iso = since_dt.isoformat()

    leads = await db.leads.find(
        {"created_at": {"$gt": since_iso}}, {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    quizzes = await db.quiz_submissions.find(
        {"created_at": {"$gt": since_iso}}, {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)

    items = []
    for l in leads:
        subtitle_parts = [l.get("phone", "")]
        if l.get("interested_home"):
            subtitle_parts.append(f"Home: {l['interested_home']}")
        if l.get("interested_package"):
            subtitle_parts.append(f"Package: {l['interested_package']}")
        items.append({
            "type": "lead",
            "id": l.get("id"),
            "title": f"New lead — {l.get('name','Unknown')}",
            "subtitle": " · ".join([p for p in subtitle_parts if p]),
            "created_at": l.get("created_at"),
            "source": l.get("source"),
            "link": "/admin/leads",
        })
    for q in quizzes:
        contact = q.get("contact_name") or "Anonymous"
        pkg = q.get("recommended_package_name") or "—"
        items.append({
            "type": "quiz",
            "id": q.get("id"),
            "title": f"Quiz submission — {contact}",
            "subtitle": f"Recommended: {pkg}",
            "created_at": q.get("created_at"),
            "link": "/admin/quiz-submissions",
        })

    items.sort(key=lambda x: x.get("created_at") or "", reverse=True)
    return {
        "items": items,
        "now": datetime.now(timezone.utc).isoformat(),
        "leads_count": len(leads),
        "quiz_count": len(quizzes),
    }


# ----------------------- Generic factory for simpler collections -----------------------
def make_crud(path: str, collection: str, ModelCls):
    @router.get(f"/{path}")
    async def _list():
        return await list_docs(collection)

    @router.get(f"/{path}/{{id_or_slug}}")
    async def _get(id_or_slug: str):
        return await get_doc(collection, id_or_slug)

    @router.post(f"/{path}", dependencies=[Depends(require_admin)])
    async def _create(body: ModelCls):
        return await upsert_doc(collection, body.model_dump())

    @router.put(f"/{path}/{{id}}", dependencies=[Depends(require_admin)])
    async def _update(id: str, body: ModelCls):
        data = body.model_dump()
        data["id"] = id
        return await upsert_doc(collection, data)

    @router.delete(f"/{path}/{{id}}", dependencies=[Depends(require_admin)])
    async def _delete(id: str):
        # For media, support both CMS media items and uploaded storage records.
        if collection == "media":
            upload = await db.media_uploads.find_one({"id": id}, {"_id": 0})
            if upload:
                from media_service import delete_object
                file_target = upload.get("url") or upload.get("storage_path")
                if file_target:
                    try:
                        delete_object(file_target)
                    except Exception as e:
                        logger.warning(f"[media] Storage delete failed: {e}")
                await db.media_uploads.delete_one({"id": id})
                return {"success": True}
        return await delete_doc(collection, id)


make_crud("testimonials", "testimonials", Testimonial)
make_crud("faqs", "faqs", FAQ)
make_crud("blogs", "blogs", Blog)
make_crud("marketplace-categories", "marketplace_categories", MarketplaceCategory)
make_crud("financial-services", "financial_services", FinancialService)
make_crud("team", "team_members", TeamMember)
make_crud("ai-modules", "ai_modules", AIPlatformModule)
make_crud("journey-steps", "journey_steps", JourneyStep)
make_crud("hero-sections", "hero_sections", HeroSection)
make_crud("media", "media", MediaItem)
make_crud("comparison", "comparison", ComparisonRow)
make_crud("stats", "stats", StatItem)


# ----------------------- Site Settings (singleton) -----------------------
@router.get("/site-settings")
async def get_site_settings():
    doc = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0})
    if not doc:
        s = SiteSettings()
        await db.site_settings.insert_one(s.model_dump())
        return s.model_dump()
    return doc

@router.put("/site-settings", dependencies=[Depends(require_admin)])
async def update_site_settings(body: SiteSettings):
    body.id = "site_settings"
    doc = body.model_dump()
    await db.site_settings.update_one({"id": "site_settings"}, {"$set": doc}, upsert=True)
    return doc


# ----------------------- Leads -----------------------
@router.post("/leads")
async def create_lead(body: LeadCreate):
    lead = Lead(**body.model_dump())
    doc = lead.model_dump()
    await db.leads.insert_one(doc)
    if body.quiz_submission_id:
        await db.quiz_submissions.update_one(
            {"id": body.quiz_submission_id},
            {"$set": {
                "converted_to_lead_id": lead.id,
                "contact_name": body.name,
                "contact_phone": body.phone,
                "contact_email": body.email,
                "contact_city": body.city,
                "status": "converted",
                "updated_at": now_iso(),
            }},
        )
    return {"success": True, "id": lead.id, "message": "Thank you! Our team will reach out shortly."}

@router.get("/leads", dependencies=[Depends(require_admin)])
async def list_leads(status: Optional[str] = None):
    q = {}
    if status:
        q["status"] = status
    docs = await db.leads.find(q, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs

class LeadUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

@router.put("/leads/{id}", dependencies=[Depends(require_admin)])
async def update_lead(id: str, body: LeadUpdate):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    update["updated_at"] = now_iso()
    result = await db.leads.update_one({"id": id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"success": True}

@router.delete("/leads/{id}", dependencies=[Depends(require_admin)])
async def del_lead(id: str):
    return await delete_doc("leads", id)


# ----------------------- Aggregated bootstrap endpoint -----------------------
@router.get("/bootstrap")
async def bootstrap():
    async def _list(c, sort="sort_order", published=True):
        q = {"is_published": True} if published else {}
        return await db[c].find(q, {"_id": 0}).sort(sort, 1).to_list(1000)

    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0})
    hero_list = await _list("hero_sections")
    hero = next((h for h in hero_list if h.get("key") == "home_hero"), (hero_list[0] if hero_list else None))
    return {
        "site_settings": settings or SiteSettings().model_dump(),
        "hero": hero,
        "homes": await _list("homes"),
        "packages": await _list("packages"),
        "ai_modules": await _list("ai_modules"),
        "marketplace": await _list("marketplace_categories"),
        "financial_services": await _list("financial_services"),
        "comparison": await _list("comparison"),
        "journey": await _list("journey_steps"),
        "testimonials": await _list("testimonials"),
        "stats": await _list("stats"),
        "faqs": await _list("faqs"),
        "team": await _list("team_members"),
    }


@router.get("/")
async def root():
    return {"service": "ConstructONS CMS API", "status": "ok"}


# ============================================================================
# Client Proposals — CRUD + PDF generation
# ============================================================================

async def _generate_ref_number() -> str:
    year = datetime.now(timezone.utc).year
    prefix = f"CON-{year}-"
    latest = await db.proposals.find(
        {"ref_number": {"$regex": f"^{prefix}"}}, {"ref_number": 1}
    ).sort("ref_number", -1).limit(1).to_list(1)
    seq = 1
    if latest:
        try:
            seq = int(latest[0]["ref_number"].split("-")[-1]) + 1
        except Exception:
            seq = 1
    return f"{prefix}{seq:04d}"


async def _hydrate_from_package(proposal_data: dict) -> dict:
    pkg = await db.packages.find_one({"slug": proposal_data.get("package_slug")}, {"_id": 0})
    if not pkg:
        return proposal_data
    if not proposal_data.get("package_name"):
        proposal_data["package_name"] = pkg.get("name")
    if not proposal_data.get("package_price_per_sqft"):
        proposal_data["package_price_per_sqft"] = pkg.get("price_per_sqft")
    if not proposal_data.get("package_timeline"):
        proposal_data["package_timeline"] = pkg.get("timeline_months")
    if not proposal_data.get("package_warranty_years"):
        proposal_data["package_warranty_years"] = pkg.get("warranty_years")
    if not proposal_data.get("scope_of_work"):
        proposal_data["scope_of_work"] = pkg.get("scope_of_work", []) or []
    if not proposal_data.get("exclusions"):
        proposal_data["exclusions"] = pkg.get("exclusions", []) or []
    if not proposal_data.get("payment_schedule"):
        proposal_data["payment_schedule"] = pkg.get("payment_schedule", []) or []
    return proposal_data


@router.get("/proposals", dependencies=[Depends(require_admin)])
async def list_proposals(status: Optional[str] = None):
    q: Dict[str, Any] = {}
    if status:
        q["status"] = status
    cursor = db.proposals.find(q, {"_id": 0}).sort("created_at", -1).limit(200)
    return await cursor.to_list(200)


@router.get("/proposals/{proposal_id}", dependencies=[Depends(require_admin)])
async def get_proposal(proposal_id: str):
    doc = await db.proposals.find_one({"id": proposal_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return doc


@router.post("/proposals", dependencies=[Depends(require_admin)])
async def create_proposal(body: Proposal):
    data = body.model_dump()
    data["id"] = data.get("id") or new_id()
    data["ref_number"] = data.get("ref_number") or (await _generate_ref_number())
    data["created_at"] = now_iso()
    data["updated_at"] = now_iso()
    data = await _hydrate_from_package(data)
    await db.proposals.insert_one(data)
    data.pop("_id", None)
    return data


@router.put("/proposals/{proposal_id}", dependencies=[Depends(require_admin)])
async def update_proposal(proposal_id: str, body: Proposal):
    data = body.model_dump()
    data["id"] = proposal_id
    data["updated_at"] = now_iso()
    data = await _hydrate_from_package(data)
    await db.proposals.update_one({"id": proposal_id}, {"$set": data}, upsert=True)
    doc = await db.proposals.find_one({"id": proposal_id}, {"_id": 0})
    return doc


@router.delete("/proposals/{proposal_id}", dependencies=[Depends(require_admin)])
async def delete_proposal(proposal_id: str):
    res = await db.proposals.delete_one({"id": proposal_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return {"success": True}


@router.get("/proposals/{proposal_id}/pdf", dependencies=[Depends(require_admin)])
async def download_proposal_pdf(proposal_id: str):
    prop = await db.proposals.find_one({"id": proposal_id}, {"_id": 0})
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found")
    pkg = await db.packages.find_one({"slug": prop.get("package_slug")}, {"_id": 0}) or {}
    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0}) or {}

    from proposal_pdf import generate_proposal_pdf
    pdf_bytes = generate_proposal_pdf(prop, pkg, settings)
    filename = f"{(prop.get('ref_number') or 'proposal').replace('/', '_')}.pdf"
    return FastAPIResponse(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-store",
        },
    )


# ============================================================================
# Custom Quotes — bespoke quotation builder
# ============================================================================

async def _generate_cq_ref_number() -> str:
    year = datetime.now(timezone.utc).year
    prefix = f"CQ-{year}-"
    latest = await db.custom_quotes.find(
        {"ref_number": {"$regex": f"^{prefix}"}}, {"ref_number": 1}
    ).sort("ref_number", -1).limit(1).to_list(1)
    seq = 1
    if latest:
        try:
            seq = int(latest[0]["ref_number"].split("-")[-1]) + 1
        except Exception:
            seq = 1
    return f"{prefix}{seq:04d}"


@router.get("/custom-quotes", dependencies=[Depends(require_admin)])
async def list_custom_quotes(status: Optional[str] = None):
    q: Dict[str, Any] = {}
    if status:
        q["status"] = status
    cursor = db.custom_quotes.find(q, {"_id": 0}).sort("created_at", -1).limit(200)
    return await cursor.to_list(200)


@router.get("/custom-quotes/{quote_id}", dependencies=[Depends(require_admin)])
async def get_custom_quote(quote_id: str):
    doc = await db.custom_quotes.find_one({"id": quote_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Custom quote not found")
    return doc


@router.post("/custom-quotes", dependencies=[Depends(require_admin)])
async def create_custom_quote(body: CustomQuote):
    from models import DEFAULT_MATERIAL_SPECS
    data = body.model_dump()
    data["id"] = data.get("id") or new_id()
    data["ref_number"] = data.get("ref_number") or (await _generate_cq_ref_number())
    data["created_at"] = now_iso()
    data["updated_at"] = now_iso()
    if not data.get("material_specs"):
        data["material_specs"] = [dict(r) for r in DEFAULT_MATERIAL_SPECS]
    await db.custom_quotes.insert_one(data)
    data.pop("_id", None)
    return data


@router.put("/custom-quotes/{quote_id}", dependencies=[Depends(require_admin)])
async def update_custom_quote(quote_id: str, body: CustomQuote):
    data = body.model_dump()
    data["id"] = quote_id
    data["updated_at"] = now_iso()
    if not data.get("ref_number"):
        existing = await db.custom_quotes.find_one({"id": quote_id}, {"ref_number": 1})
        if existing and existing.get("ref_number"):
            data["ref_number"] = existing["ref_number"]
        else:
            data["ref_number"] = await _generate_cq_ref_number()
    await db.custom_quotes.update_one({"id": quote_id}, {"$set": data}, upsert=True)
    doc = await db.custom_quotes.find_one({"id": quote_id}, {"_id": 0})
    return doc


@router.delete("/custom-quotes/{quote_id}", dependencies=[Depends(require_admin)])
async def delete_custom_quote(quote_id: str):
    res = await db.custom_quotes.delete_one({"id": quote_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Custom quote not found")
    return {"success": True}


# ============================================================================
# Interior Library & Quote Templates
# ============================================================================

@router.get("/interior-library", dependencies=[Depends(require_admin)])
async def list_interior_library(category: Optional[str] = None, q: Optional[str] = None):
    query: Dict[str, Any] = {}
    if category:
        query["category"] = category
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"brand": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
        ]
    docs = await db.interior_library.find(query, {"_id": 0}).sort("category", 1).limit(500).to_list(500)
    return docs


@router.get("/interior-library/categories", dependencies=[Depends(require_admin)])
async def list_interior_library_categories():
    cats = await db.interior_library.distinct("category")
    return sorted(cats)


@router.get("/quote-templates", dependencies=[Depends(require_admin)])
async def list_quote_templates():
    cursor = db.quote_templates.find({}, {"_id": 0}).sort("created_at", -1).limit(200)
    return await cursor.to_list(200)


async def require_admin_or_customer(request: Request):
    """Dependency that accepts either an Admin session or a Customer session."""
    try:
        return await require_admin(request)
    except HTTPException:
        pass
    try:
        return await get_current_customer(request)
    except HTTPException:
        pass
    raise HTTPException(status_code=401, detail="Authentication required")


@router.post("/media/upload", dependencies=[Depends(require_admin_or_customer)])
async def upload_media(file: UploadFile = File(...), category: str = Form("general")):
    """Upload a single image to Cloudinary or local storage (accessible by Admin or Customer)."""
    from media_service import (
        put_object, build_storage_path,
        ALLOWED_MIME_PREFIXES, MAX_UPLOAD_BYTES,
    )

    ct = (file.content_type or "").lower()
    if not any(ct.startswith(p) for p in ALLOWED_MIME_PREFIXES):
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ct}")

    data = await file.read()
    if len(data) == 0:
        raise HTTPException(status_code=400, detail="Empty file submitted")

    cat = (category or "general").lower()
    max_bytes = 1 * 1024 * 1024 if cat == "team" else MAX_UPLOAD_BYTES

    if len(data) > max_bytes:
        mb = max_bytes / (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds {mb:g} MB limit for category '{cat}'",
        )

    path = build_storage_path(category, file.filename or "image", ct)
    try:
        result = put_object(path, data, ct)
    except Exception as e:
        logger.error(f"[media] Upload failed: {e}")
        raise HTTPException(status_code=502, detail=f"Storage upload failed: {e}")

    stored_path = result.get("path") or path
    final_url = result.get("url") or f"/api/media/{stored_path}"

    record = {
        "id": new_id(),
        "storage_path": stored_path,
        "url": final_url,
        "original_filename": file.filename,
        "content_type": ct,
        "size": len(data),
        "category": category,
        "is_deleted": False,
        "created_at": now_iso(),
    }
    await db.media_uploads.insert_one(record)
    return {
        "id": record["id"],
        "storage_path": stored_path,
        "url": final_url,
        "size": len(data),
        "content_type": ct,
        "original_filename": file.filename,
    }
# ----------------------- Media Download -----------------------
@router.get("/media/{path:path}")
async def download_media(path: str):
    """Public read endpoint for uploaded media."""
    from media_service import get_object

    try:
        content, fetched_content_type = get_object(path)
        return FastAPIResponse(
            content=content,
            media_type=fetched_content_type,
            headers={"Cache-Control": "public, max-age=86400"},
        )
    except Exception:
        raise HTTPException(status_code=404, detail="File not found")


# ============================================================================
# Package Version History
# ============================================================================
MAX_VERSIONS_PER_PACKAGE = 20

async def _snapshot_package(package_id: str, note: str = "edit"):
    current = await db.packages.find_one({"id": package_id}, {"_id": 0})
    if not current:
        return
    snap = {
        "id": new_id(),
        "package_id": package_id,
        "package_slug": current.get("slug"),
        "note": note,
        "snapshot_at": now_iso(),
        "data": current,
    }
    await db.package_versions.insert_one(snap)
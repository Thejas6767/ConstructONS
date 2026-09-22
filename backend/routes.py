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
    logout_customer as _logout_customer, CustomerProfileUpdate
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

@router.post("/customer/auth/google")
async def customer_process_google(body: GoogleAuthBody, response: FastAPIResponse):
    return await process_google_auth(body, response)


@router.get("/customer/me")
async def customer_me(customer=Depends(get_current_customer)):
    return customer


@router.put("/customer/profile")
async def update_customer_profile(body: CustomerProfileUpdate, customer=Depends(get_current_customer)):
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
    return await _logout_customer(request, response)


# ============================================================================
# Admin CRM: Registered Client Users Directory
# ============================================================================
@router.get("/admin/customers", dependencies=[Depends(require_admin)])
async def list_registered_customers(q: Optional[str] = None):
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


# ----------------------- Media Upload Studio -----------------------
@router.post("/media/upload", dependencies=[Depends(require_admin_or_customer)])
async def upload_media(file: UploadFile = File(...), category: str = Form("general")):
    """Upload a single file to Cloudinary or local storage (accessible by Admin or Customer)."""
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
        raise HTTPException(status_code=413, detail=f"File exceeds {mb:g} MB limit for category '{cat}'")

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


@router.get("/media/{path:path}")
async def download_media(path: str):
    """Public read of any image uploaded locally."""
    from media_service import get_object

    try:
        content, fetched_content_type = get_object(path)
        return FastAPIResponse(
            content=content,
            media_type=fetched_content_type,
            headers={"Cache-Control": "public, max-age=86400"},
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail="File not found")


@router.delete("/media/{media_id}", dependencies=[Depends(require_admin)])
async def delete_media(media_id: str):
    res = await db.media_uploads.update_one(
        {"id": media_id},
        {"$set": {"is_deleted": True, "deleted_at": now_iso()}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Media not found")
    return {"success": True}


# ----------------------- Generic factory -----------------------
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


# ----------------------- Site Settings -----------------------
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
    return {"success": True, "id": lead.id, "message": "Thank you! Our team will reach out shortly."}

@router.get("/leads", dependencies=[Depends(require_admin)])
async def list_leads(status: Optional[str] = None):
    q = {}
    if status:
        q["status"] = status
    docs = await db.leads.find(q, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs


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


# Package Version History Helper
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
@router.delete("/media/{media_id}", dependencies=[Depends(require_admin)])
async def delete_media(media_id: str):
    from media_service import delete_object

    record = await db.media_uploads.find_one({"id": media_id})
    if not record:
        raise HTTPException(status_code=404, detail="Media not found")

    # Hard delete from Cloudinary / Local Disk
    file_target = record.get("url") or record.get("storage_path")
    if file_target:
        delete_object(file_target)

    # Delete from MongoDB
    await db.media_uploads.delete_one({"id": media_id})
    return {"success": True}
from contextlib import asynccontextmanager
import os
import logging
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from routes import router as api_router  # noqa: E402
from project_routes import proj_router  # noqa: E402

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- STARTUP LOGIC ---
    from db import db
    from seed import seed_all
    
    # ⚡ Build MongoDB Indexes
    logger.info("Building MongoDB indexes...")
    try:
        await db.projects.create_index("customer_email")
        await db.projects.create_index("id", unique=True)
        await db.customers.create_index("email", unique=True)
        await db.customer_sessions.create_index("session_token", unique=True)
        await db.team_members.create_index("id")
        await db.leads.create_index("created_at")
        await db.custom_quotes.create_index("public_token")
        await db.packages.create_index("slug")
        logger.info("Indexes verified.")
    except Exception as e:
        logger.warning(f"Failed to create indexes: {e}")

    # Seed data if empty
    critical_collections = [
        "homes", "packages", "hero_sections", "site_settings",
        "financial_services", "marketplace_categories",
    ]
    needs_seed = False
    for coll in critical_collections:
        count = await db[coll].count_documents({})
        if count == 0:
            logger.info(f"Collection '{coll}' is empty — will trigger seed.")
            needs_seed = True
            break

    if needs_seed:
        logger.info("Seeding sample data...")
        await seed_all()
        logger.info("Seeding complete.")
    else:
        logger.info("All critical collections populated — skipping seed.")

    try:
        from media_service import init_storage
        init_storage()
    except Exception as e:
        logger.warning(f"Object storage init deferred: {e}")

    try:
        from auth import ensure_admin_seeded
        await ensure_admin_seeded()
        logger.info("Admin user seed check complete.")
    except Exception as e:
        logger.error(f"Admin seed failed: {e}")

    try:
        count = await db.interior_library.count_documents({})
        if count == 0:
            from interior_library_seed import INTERIOR_LIBRARY_STARTER
            from models import InteriorLibraryItem
            docs = []
            for item in INTERIOR_LIBRARY_STARTER:
                obj = InteriorLibraryItem(**item).model_dump()
                docs.append(obj)
            if docs:
                await db.interior_library.insert_many(docs)
                logger.info(f"Interior library seeded with {len(docs)} items.")
    except Exception as e:
        logger.error(f"Interior library seed failed: {e}")

    yield  # Server runs

    from db import client
    client.close()


app = FastAPI(
    title="ConstructONS CMS API",
    version="1.0.0",
    lifespan=lifespan
)

# 🛡️ CORS Middleware MUST be added before routers
raw_cors = os.environ.get('CORS_ORIGINS', os.environ.get('CORS', '*'))

if raw_cors.strip() == '*':
    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://construct-ons-six.vercel.app"
    ]
else:
    origins = [origin.strip() for origin in raw_cors.split(',') if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🛡️ Global Exception Handler ensures CORS headers are ALWAYS present on 500 errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Server Error: {str(exc)}"},
    )

app.include_router(api_router)
app.include_router(proj_router)
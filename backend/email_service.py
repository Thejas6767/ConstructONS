import os
import logging
import asyncio
import httpx
from typing import Optional

logger = logging.getLogger(__name__)

# Load Resend API Key & Configuration
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
# Note: Use 'onboarding@resend.dev' for testing if custom domain is not yet verified on Resend.
# Switch to 'updates@constructons.in' or 'notifications@constructons.com' once domain DNS is verified.
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "ConstructONS Updates <onboarding@resend.dev>")
PUBLIC_PORTAL_URL = os.environ.get("PUBLIC_PORTAL_URL", "https://construct-ons-six.vercel.app")


def _get_branded_html_template(
    customer_name: str,
    project_title: str,
    notification_title: str,
    notification_message: str,
    portal_link: str
) -> str:
    """Generates a high-conversion, responsive HTML email matching ConstructONS Design System.
    
    Colors:
    - Primary Construction Orange: #FF5A00
    - Deep Navy: #000F1B
    - Concrete Light Grey: #F2F2F2
    """
    full_link = portal_link if portal_link.startswith("http") else f"{PUBLIC_PORTAL_URL}{portal_link}"
    client_greeting = customer_name if customer_name else "Valued Client"

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{notification_title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F2F2F2; font-family: 'Poppins', 'Segoe UI', Arial, sans-serif; color: #111111; -webkit-font-smoothing: antialiased;">
        
        <!-- Main Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F2F2F2; padding: 30px 10px;">
            <tr>
                <td align="center">
                    
                    <!-- Email Body Card -->
                    <table role="presentation" width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                        
                        <!-- Header Banner -->
                        <tr>
                            <td style="background-color: #000F1B; padding: 30px 40px; text-align: left; border-bottom: 4px solid #FF5A00;">
                                <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">
                                    Construct<span style="color: #FF5A00;">ONS</span><span style="font-size: 14px; vertical-align: super; color: #FF5A00;">™</span>
                                </h1>
                                <p style="color: #A6A6A6; font-size: 12px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 500;">
                                    Everything Construction. Always On.
                                </p>
                            </td>
                        </tr>

                        <!-- Project Banner Tag -->
                        <tr>
                            <td style="padding: 24px 40px 0 40px;">
                                <div style="display: inline-block; background-color: #FFF3EC; border-left: 3px solid #FF5A00; padding: 6px 12px; border-radius: 4px;">
                                    <span style="color: #FF5A00; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                        PROJECT: {project_title}
                                    </span>
                                </div>
                            </td>
                        </tr>

                        <!-- Content Area -->
                        <tr>
                            <td style="padding: 20px 40px 30px 40px;">
                                <h2 style="color: #000F1B; font-size: 20px; font-weight: 700; margin: 0 0 12px 0;">
                                    {notification_title}
                                </h2>
                                
                                <p style="font-size: 15px; line-height: 1.6; color: #333333; margin: 0 0 16px 0;">
                                    Dear <strong>{client_greeting}</strong>,
                                </p>

                                <p style="font-size: 15px; line-height: 1.6; color: #4A4A4A; margin: 0 0 24px 0; background-color: #FAFAFA; padding: 16px; border-radius: 8px; border: 1px solid #EAEAEA;">
                                    {notification_message}
                                </p>

                                <!-- Action Button -->
                                <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 12px 0;">
                                    <tr>
                                        <td align="center" style="border-radius: 8px; background-color: #FF5A00;">
                                            <a href="{full_link}" target="_blank" style="font-size: 15px; font-family: 'Poppins', Arial, sans-serif; color: #FFFFFF; text-decoration: none; border-radius: 8px; padding: 14px 28px; border: 1px solid #FF5A00; display: inline-block; font-weight: 600; letter-spacing: 0.2px;">
                                                View Live Portal Update &rarr;
                                            </a>
                                        </td>
                                    </tr>
                                </table>

                                <p style="font-size: 12px; color: #888888; margin-top: 16px;">
                                    Or copy & paste this URL into your browser: <br>
                                    <a href="{full_link}" style="color: #FF5A00; text-decoration: underline;">{full_link}</a>
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #F9F9F9; padding: 24px 40px; text-align: center; border-top: 1px solid #EEEEEE; font-size: 12px; color: #777777; line-height: 1.5;">
                                <p style="margin: 0 0 6px 0; font-weight: 600; color: #000F1B;">
                                    ConstructONS™ — India's First Integrated Construction Ecosystem
                                </p>
                                <p style="margin: 0 0 10px 0;">
                                    Your trusted partner for every stage of home construction.
                                </p>
                                <p style="margin: 0; color: #999999; font-size: 11px;">
                                    This is an automated notification from your ConstructONS Customer Portal. <br>
                                    If you have questions, reply to this email or contact your assigned Site Engineer.
                                </p>
                            </td>
                        </tr>

                    </table>

                </td>
            </tr>
        </table>

    </body>
    </html>
    """


async def send_email_via_resend(to_email: str, subject: str, html_content: str) -> bool:
    """Dispatches email asynchronously using Resend HTTP REST API.
    Does NOT throw exceptions — logs errors defensively.
    """
    if not RESEND_API_KEY:
        logger.warning("[Resend Email] RESEND_API_KEY is not configured in .env. Email skipped.")
        return False

    if not to_email or "@" not in to_email:
        logger.warning(f"[Resend Email] Invalid recipient email '{to_email}'. Email skipped.")
        return False

    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "from": SENDER_EMAIL,
        "to": [to_email.strip().lower()],
        "subject": subject,
        "html": html_content,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            if response.status_code in (200, 201):
                res_data = response.json()
                logger.info(f"[Resend Email] Email sent successfully to {to_email}. ID: {res_data.get('id')}")
                return True
            else:
                logger.error(f"[Resend Email] Failed to send email. Status {response.status_code}: {response.text}")
                return False
    except Exception as e:
        logger.error(f"[Resend Email] Exception sending email to {to_email}: {e}")
        return False


async def send_project_notification_email(
    to_email: str,
    customer_name: str,
    project_title: str,
    notification_title: str,
    notification_message: str,
    portal_link: str
):
    """Wrapper function to prepare template and trigger Resend email task."""
    subject = f"[{project_title}] {notification_title} — ConstructONS"
    html_content = _get_branded_html_template(
        customer_name=customer_name,
        project_title=project_title,
        notification_title=notification_title,
        notification_message=notification_message,
        portal_link=portal_link
    )
    await send_email_via_resend(to_email, subject, html_content)
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { asTrimmedString, isValidEmail } from "@/lib/validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  try {
    const { id } = await context.params;
    const contactId = Number(id);

    if (!Number.isInteger(contactId)) {
      return NextResponse.json(
        { error: "Invalid contact ID." },
        { status: 400 },
      );
    }

    const body = await request.json();

    const firstName = asTrimmedString(body.firstName);
    const lastName = asTrimmedString(body.lastName);
    const jobTitle = asTrimmedString(body.jobTitle);
    const email = asTrimmedString(body.email);
    const phone = asTrimmedString(body.phone);
    const notes = asTrimmedString(body.notes);

    if (!firstName || firstName.length > 100) {
      return NextResponse.json(
        {
          error: "First name is required and must be 100 characters or fewer.",
        },
        { status: 400 },
      );
    }

    if (!lastName || lastName.length > 100) {
      return NextResponse.json(
        { error: "Last name is required and must be 100 characters or fewer." },
        { status: 400 },
      );
    }

    if (jobTitle.length > 200) {
      return NextResponse.json(
        { error: "Job title must be 200 characters or fewer." },
        { status: 400 },
      );
    }

    if (email && (email.length > 255 || !isValidEmail(email))) {
      return NextResponse.json(
        { error: "Email must be a valid email address." },
        { status: 400 },
      );
    }

    if (phone && phone.length > 20) {
      return NextResponse.json(
        { error: "Phone must be 20 characters or fewer." },
        { status: 400 },
      );
    }

    if (notes.length > 1000) {
      return NextResponse.json(
        { error: "Notes must be 1000 characters or fewer." },
        { status: 400 },
      );
    }

    const result = await db.query(
      `
        UPDATE contact
        SET
          first_name = $1,
          last_name = $2,
          job_title = $3,
          email = $4,
          phone = $5,
          notes = $6,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $7 AND user_id = $8
        RETURNING
          id, company_id, first_name, last_name, job_title, email, phone, notes, created_at, updated_at
      `,
      [
        firstName,
        lastName,
        jobTitle || null,
        email || null,
        phone || null,
        notes || null,
        contactId,
        session.user.id,
      ],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Contact not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ contact: result.rows[0] });
  } catch (error) {
    console.error("Failed to update contact:", error);

    return NextResponse.json(
      { error: "Unable to update contact." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  try {
    const { id } = await context.params;
    const contactId = Number(id);

    if (!Number.isInteger(contactId)) {
      return NextResponse.json(
        { error: "Invalid contact ID." },
        { status: 400 },
      );
    }

    const result = await db.query(
      `DELETE FROM contact WHERE id = $1 AND user_id = $2 RETURNING id`,
      [contactId, session.user.id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Contact not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete contact:", error);

    return NextResponse.json(
      { error: "Unable to delete contact." },
      { status: 500 },
    );
  }
}

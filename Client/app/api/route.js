// app/api/petlogix/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all pets
export async function GET() {
  try {
    const pets = await prisma.petlogix.findMany({
      orderBy: { id: "desc" },
    });
    return NextResponse.json({ success: true, pets });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { success: false, message: "❌ Failed to fetch pets", error: error.message },
      { status: 500 }
    );
  }
}

// POST new pet
export async function POST(req) {
  try {
    const data = await req.json();

    // If id is included, remove it
    delete data.id;

    const pet = await prisma.petlogix.create({ data });
    return NextResponse.json({
      success: true,
      message: "✅ Pet added successfully",
      pet,
    });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { success: false, message: "❌ Failed to add pet", error: error.message },
      { status: 500 }
    );
  }
}

// PUT update pet
export async function PUT(req) {
  try {
    const { id, ...data } = await req.json();
    const pet = await prisma.petlogix.update({
      where: { id: parseInt(id) }, // ensure it's an integer
      data,
    });
    return NextResponse.json({
      success: true,
      message: "✏️ Pet updated successfully",
      pet,
    });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { success: false, message: "❌ Failed to update pet", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE pet
export async function DELETE(req) {
  try {
    const { id } = await req.json(); // id from JSON body
    if (!id) throw new Error("No ID provided");

    await prisma.petlogix.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "🗑️ Pet deleted successfully",
    });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "❌ Failed to delete pet", error: error.message },
      { status: 500 }
    );
  }
}

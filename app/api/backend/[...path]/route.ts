import { NextRequest, NextResponse } from "next/server";
import { publishRealtimeEvent } from "../../../services/realtime";

const API_BASE_URL = "http://localhost:8080/api/v1";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const segments = (await params).path ?? [];
  return proxyToBackend(request, segments, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const segments = (await params).path ?? [];
  return proxyToBackend(request, segments, "POST");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const segments = (await params).path ?? [];
  return proxyToBackend(request, segments, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const segments = (await params).path ?? [];
  return proxyToBackend(request, segments, "DELETE");
}

async function proxyToBackend(
  request: NextRequest,
  segments: string[],
  method: string,
) {
  const targetPath = segments.length ? `/${segments.join("/")}` : "/";
  const url = `${API_BASE_URL}${targetPath}${request.nextUrl.search}`;

  try {
    const init: RequestInit = {
      method,
      headers: {
        Accept: "application/json",
        ...(request.headers.get("authorization")
          ? { Authorization: request.headers.get("authorization") as string }
          : {}),
        ...(request.headers.get("content-type")
          ? { "Content-Type": request.headers.get("content-type") as string }
          : {}),
      },
    };

    if (method !== "GET" && method !== "DELETE") {
      init.body = await request.text();
    }

    const response = await fetch(url, init);
    const text = await response.text();

    if (response.ok && method !== "GET" && segments[0]) {
      publishRealtimeEvent(
        segments[0],
        method === "POST"
          ? "created"
          : method === "DELETE"
            ? "deleted"
            : "updated",
        targetPath,
      );
    }

    try {
      const json = JSON.parse(text);
      return NextResponse.json(json, { status: response.status });
    } catch {
      return new NextResponse(text, {
        status: response.status,
        headers: {
          "Content-Type": response.headers.get("content-type") ?? "text/plain",
        },
      });
    }
  } catch {
    return NextResponse.json(
      {
        success: false,
        error:
          "Backend service is unavailable. Please ensure the API is running on port 8080.",
      },
      { status: 503 },
    );
  }
}

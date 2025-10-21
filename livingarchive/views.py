# livingarchive/views.py
import json
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseNotAllowed
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from .models import CesiumPin

# keep your 3D page render
def cesium_view(request):
    return render(request, "cesium/tileset_annotations.html")

# ---- DB-backed API ----
def annotations_geojson(request):
    features = [p.as_feature() for p in CesiumPin.objects.order_by("id")]
    return JsonResponse({"type": "FeatureCollection", "features": features})

@csrf_exempt
def annotations_create(request):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    try:
        data = json.loads(request.body.decode("utf-8"))
        p = CesiumPin.objects.create(
            title=data.get("title","").strip()[:200],
            notes=data.get("notes",""),
            lon=float(data["lon"]),
            lat=float(data["lat"]),
            height=float(data.get("height") or 0),
        )
        return JsonResponse({"ok": True, "id": p.id})
    except Exception as e:
        return HttpResponseBadRequest(
            json.dumps({"ok": False, "error": str(e)}),
            content_type="application/json"
        )

@csrf_exempt
def annotations_update_delete(request, pk):
    try:
        p = CesiumPin.objects.get(pk=pk)
    except CesiumPin.DoesNotExist:
        return HttpResponseBadRequest(
            json.dumps({"ok": False, "error": "not found"}),
            content_type="application/json"
        )

    if request.method == "DELETE":
        p.delete()
        return JsonResponse({"ok": True})

    if request.method == "PATCH":
        data = json.loads(request.body.decode("utf-8"))
        if "title" in data:  p.title  = data["title"].strip()[:200]
        if "notes" in data:  p.notes  = data["notes"]
        if "lon"   in data:  p.lon    = float(data["lon"])
        if "lat"   in data:  p.lat    = float(data["lat"])
        if "height" in data: p.height = float(data["height"])
        p.save()
        return JsonResponse({"ok": True})

    return HttpResponseNotAllowed(["DELETE", "PATCH"])

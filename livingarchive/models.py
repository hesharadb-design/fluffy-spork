from django.db import models

class CesiumPin(models.Model):
    title = models.CharField(max_length=200)
    notes = models.TextField(blank=True)
    lon = models.FloatField()
    lat = models.FloatField()
    height = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def as_feature(self):
        return {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [self.lon, self.lat]},
            "properties": {
                "id": self.id,
                "title": self.title,
                "notes": self.notes,
                "height": self.height,
                "created_at": self.created_at.isoformat(),
            },
        }

from django.db import models

class Shipment(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'PENDING'),
        ('IN TRANSIT', 'IN TRANSIT'),
        ('COMPLETED', 'COMPLETED')
    ]

    shipment_id = models.CharField(max_length=20, unique=True)
    client = models.CharField(max_length=100)
    origin = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.shipment_id} - {self.client}"
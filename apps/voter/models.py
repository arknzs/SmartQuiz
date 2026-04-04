from django.db import models
from easy_thumbnails.fields import ThumbnailerImageField

class Voter(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, blank=True, default="")
    description = models.TextField(blank=True, default="")
    answer = models.JSONField(default=dict)

    def __str__(self):
        return self.name or f'voter #{self.id}'


class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.IntegerField()
    zone = models.CharField(max_length=255, blank=True, default="")
    room_type = models.CharField(max_length=255, blank=True, default="")

    def __str__(self):
        return self.name



class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    image = ThumbnailerImageField(upload_to="product/", null=True, blank=True)


class BlockModel(models.Model):
    blockname = models.CharField(max_length=100, blank=True, null=True)
    products = models.ManyToManyField(Product)

    def __str__(self):
        return self.blockname

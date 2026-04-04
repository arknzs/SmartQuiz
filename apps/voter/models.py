from django.db import models
from easy_thumbnails.fields import ThumbnailerImageField


class Style(models.Model):
    name = models.CharField(max_length=100)
    style_kf = models.FloatField()

class RoomType(models.Model):
    name = models.CharField(max_length=100)
    base_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='price for 1m')


class Zone(models.Model):
    name = models.CharField(max_length=100)
    zone_kf = models.FloatField()


class Voter(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, blank=True, default="")
    description = models.TextField(blank=True, default="")
    answer = models.JSONField(default=dict)

    def __str__(self):
        return self.name or f'voter #{self.id}'


class Product(models.Model):
    name = models.CharField(max_length=100)
    price_at_square = models.DecimalField(max_digits=10, decimal_places=2)
    zone = models.ForeignKey(Zone, on_delete=models.CASCADE, blank=True, null=True)
    room_type = models.ForeignKey(RoomType, on_delete=models.CASCADE, blank=True, null=True)
    style = models.ForeignKey(Style, on_delete=models.CASCADE, blank=True, null=True)


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


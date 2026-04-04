from django.db import models

try:
    from easy_thumbnails.fields import ThumbnailerImageField
except ModuleNotFoundError:
    ThumbnailerImageField = models.FileField


class Style(models.Model):
    name = models.CharField(max_length=100)
    style_kf = models.FloatField(default=0)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class StylePictures(models.Model):
    style = models.ForeignKey(Style, on_delete=models.CASCADE)
    image = ThumbnailerImageField(upload_to='style_pictures')


class Room(models.Model):
    name = models.CharField(max_length=101)
    base_price = models.IntegerField(default=0)
    def __str__(self):
        return self.name


class Zone(models.Model):
    name = models.CharField(max_length=100)
    zone_kf = models.FloatField(default=0)

    def __str__(self):
        return self.name


class Voter(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, blank=True, default="")
    description = models.TextField(blank=True, default="")
    answer = models.JSONField(default=dict)

    def __str__(self):
        return self.name or f'voter #{self.id}'


class Product(models.Model):
    name = models.CharField(max_length=100)
    price_at_square = models.DecimalField(max_digits=10, decimal_places=2, default=15000)
    zone = models.ForeignKey(Zone, on_delete=models.CASCADE, blank=True, null=True)
    room_type = models.ForeignKey(Room, on_delete=models.CASCADE, blank=True, null=True)
    style = models.ForeignKey(Style, on_delete=models.CASCADE, blank=True, null=True)


    def __str__(self):
        return self.name



class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    image = ThumbnailerImageField(upload_to="product/", null=True, blank=True)


class BlockModel(models.Model):
    blockname = models.CharField(max_length=100, blank=True, null=True)
    style = models.ManyToManyField(Style)
    zone = models.ManyToManyField(Zone)
    Room = models.ManyToManyField(Room)

    def __str__(self):
        return self.blockname


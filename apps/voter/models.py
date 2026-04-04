from django.db import models
from easy_thumbnails.fields import ThumbnailerImageField

class Voter(models.Model):
    id = models.AutoField(primary_key=True)
    answer = models.JSONField(default=dict)

    def __str__(self):
        return 'voter'


class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.IntegerField()

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
from django.contrib import admin

from apps.voter.models import Voter, ProductImage, Product, BlockModel


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductModelAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline]


admin.site.register(Voter)
admin.site.register(BlockModel)
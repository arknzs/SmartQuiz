from django.contrib import admin

from apps.voter.models import Voter, ProductImage, Product, BlockModel


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductModelAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline]
    list_display = ("name", "price", "zone", "room_type")
    search_fields = ("name", "zone", "room_type")


admin.site.register(BlockModel)


@admin.register(Voter)
class VoterAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name", "description")

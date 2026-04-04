from django.contrib import admin

from apps.voter.models import Voter, ProductImage, Product, BlockModel, Style, Room, Zone, StylePictures


class StyleImageInline(admin.TabularInline):
    model = StylePictures


@admin.register(Style)
class StyleAdmin(admin.ModelAdmin):
    inlines = [StyleImageInline]
    list_display = ('name',)



class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductModelAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline]
    list_display = ("name", "price_at_square", "zone", "room_type")
    search_fields = ("name", "zone", "room_type")


admin.site.register(BlockModel)
admin.site.register(Room)
admin.site.register(Zone)


@admin.register(Voter)
class VoterAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name", "description")

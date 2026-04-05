from django.contrib import admin
from django.http import HttpResponseRedirect
from django.urls import reverse

from apps.voter.models import Voter, ProductImage, Product, BlockModel, Style, Room, Zone, StylePictures, BotSettings


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


@admin.register(BotSettings)
class BotSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {"fields": ("admin_chat_id",)}),
    )

    def has_add_permission(self, request):
        if BotSettings.objects.exists():
            return False
        return super().has_add_permission(request)

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        settings_obj = BotSettings.load()
        url = reverse("admin:voter_botsettings_change", args=[settings_obj.pk])
        return HttpResponseRedirect(url)


@admin.register(Voter)
class VoterAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name", "description")

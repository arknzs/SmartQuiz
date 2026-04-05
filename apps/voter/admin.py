from django.contrib import admin
from django.http import HttpResponseRedirect
from django.urls import reverse

from apps.voter.models import (
    BlockModel,
    BotSettings,
    Product,
    ProductImage,
    Room,
    Style,
    StylePictures,
    TelegramRecipient,
    Voter,
    Zone,
)


class StyleImageInline(admin.TabularInline):
    model = StylePictures


@admin.register(Style)
class StyleAdmin(admin.ModelAdmin):
    inlines = [StyleImageInline]
    list_display = ("name",)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductModelAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline]
    list_display = ("name", "price_at_square", "zone", "room_type")
    search_fields = ("name", "zone__name", "room_type__name")


@admin.register(TelegramRecipient)
class TelegramRecipientAdmin(admin.ModelAdmin):
    list_display = ("chat_id", "username", "first_name", "last_name", "is_active", "last_seen")
    list_filter = ("is_active",)
    search_fields = ("=chat_id", "username", "first_name", "last_name")
    ordering = ("-last_seen",)


admin.site.register(BlockModel)
admin.site.register(Room)
admin.site.register(Zone)


@admin.register(BotSettings)
class BotSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        (
            None,
            {
                "fields": ("recipient", "admin_chat_id"),
                "description": (
                    "Сначала выберите пользователя из списка Telegram-получателей. "
                    "Поле chat id ниже работает как запасной вариант."
                ),
            },
        ),
    )
    autocomplete_fields = ("recipient",)

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

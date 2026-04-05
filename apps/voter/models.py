import os

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
    image = ThumbnailerImageField(upload_to="style_pictures")


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


class TelegramRecipient(models.Model):
    chat_id = models.BigIntegerField(unique=True)
    username = models.CharField(max_length=150, blank=True, default="")
    first_name = models.CharField(max_length=150, blank=True, default="")
    last_name = models.CharField(max_length=150, blank=True, default="")
    is_active = models.BooleanField(default=True)
    last_seen = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Получатель Telegram"
        verbose_name_plural = "Получатели Telegram"
        ordering = ("-last_seen", "chat_id")

    @property
    def display_name(self):
        full_name = " ".join(part for part in [self.first_name, self.last_name] if part).strip()
        if full_name:
            return full_name
        if self.username:
            return f"@{self.username}"
        return str(self.chat_id)

    def __str__(self):
        details = []
        if self.username:
            details.append(f"@{self.username}")
        details.append(str(self.chat_id))
        return f"{self.display_name} ({', '.join(details)})"


class BotSettings(models.Model):
    id = models.PositiveSmallIntegerField(primary_key=True, default=1, editable=False)
    recipient = models.ForeignKey(
        TelegramRecipient,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="bot_settings",
    )
    admin_chat_id = models.CharField(max_length=64, blank=True, default="")

    class Meta:
        verbose_name = "Настройки бота"
        verbose_name_plural = "Настройки бота"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        if not obj.recipient_id:
            fallback_chat_id = str(obj.admin_chat_id or os.getenv("ADMIN_CHAT_ID", "")).strip()
            if fallback_chat_id:
                try:
                    recipient, _ = TelegramRecipient.objects.get_or_create(chat_id=int(fallback_chat_id))
                    obj.recipient = recipient
                    if not obj.admin_chat_id:
                        obj.admin_chat_id = fallback_chat_id
                    obj.save(update_fields=["recipient", "admin_chat_id"])
                except (TypeError, ValueError):
                    if not obj.admin_chat_id:
                        obj.admin_chat_id = fallback_chat_id
                        obj.save(update_fields=["admin_chat_id"])
        return obj

    def get_chat_id(self):
        if self.recipient_id:
            return str(self.recipient.chat_id).strip()
        return str(self.admin_chat_id).strip()

    def __str__(self):
        return "Настройки Telegram-бота"


class Voter(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, blank=True, default="")
    description = models.TextField(blank=True, default="")
    answer = models.JSONField(default=dict)

    def __str__(self):
        return self.name or f"voter #{self.id}"


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

from django.db import migrations


def seed_telegram_recipient(apps, schema_editor):
    BotSettings = apps.get_model("voter", "BotSettings")
    TelegramRecipient = apps.get_model("voter", "TelegramRecipient")

    try:
        settings_obj = BotSettings.objects.get(pk=1)
    except BotSettings.DoesNotExist:
        return

    raw_chat_id = (settings_obj.admin_chat_id or "").strip()
    if not raw_chat_id:
        return

    try:
        chat_id = int(raw_chat_id)
    except (TypeError, ValueError):
        return

    recipient, _ = TelegramRecipient.objects.get_or_create(chat_id=chat_id)
    if settings_obj.recipient_id != recipient.id:
        settings_obj.recipient_id = recipient.id
        settings_obj.save(update_fields=["recipient"])


class Migration(migrations.Migration):

    dependencies = [
        ("voter", "0017_telegramrecipient_botsettings_recipient"),
    ]

    operations = [
        migrations.RunPython(seed_telegram_recipient, migrations.RunPython.noop),
    ]

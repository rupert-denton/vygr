# Generated by Django 3.1.7 on 2021-10-20 09:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('testingland', '0009_auto_20210928_1116'),
    ]

    operations = [
        migrations.AlterField(
            model_name='mapcafes',
            name='description',
            field=models.CharField(max_length=15000, null=True),
        ),
    ]

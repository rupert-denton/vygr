# Generated by Django 3.1 on 2020-10-07 10:42

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('testingland', '0009_auto_20200930_0512'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='uservenue',
            unique_together={('list', 'venue')},
        ),
    ]

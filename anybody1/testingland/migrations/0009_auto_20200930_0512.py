# Generated by Django 3.1 on 2020-09-30 05:12

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('testingland', '0008_userlist_venue_name'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userlist',
            name='venue_name',
        ),
        migrations.CreateModel(
            name='UserVenue',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('list', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='testingland.userlist')),
                ('venue', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='testingland.mapcafes')),
            ],
        ),
    ]

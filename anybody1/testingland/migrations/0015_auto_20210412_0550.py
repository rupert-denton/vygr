# Generated by Django 3.1.7 on 2021-04-12 05:50

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('testingland', '0014_auto_20210409_0223'),
    ]

    operations = [
        migrations.RenameField(
            model_name='uservenue',
            old_name='list',
            new_name='user_list',
        ),
        migrations.AlterUniqueTogether(
            name='uservenue',
            unique_together={('user_list', 'venue')},
        ),
        migrations.DeleteModel(
            name='UserFollowers',
        ),
    ]

from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings
import ipinfo

def get_ip_details(ip_address=None):
	ipinfo_token = getattr(settings, "IPINFO_TOKEN", None)
	ipinfo_settings = getattr(settings, "IPINFO_SETTINGS", {})
	ip_data = ipinfo.getHandler(ipinfo_token, **ipinfo_settings)
	ip_data = ip_data.getDetails(ip_address)
	return ip_data

get_ip_details('115.70.22.200')

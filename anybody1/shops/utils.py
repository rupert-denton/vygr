import requests

def get_geo_coordinates(ip):
    token = "b1c5b839af7430"
    url = f"https://ipinfo.io/{ip}?token={token}"
    response = requests.get(url)
    if response.status_code == 200:
        loc = response.json()['loc']
        if loc:
            a,b =  loc.split(",")
            return float(a), float(b)
    return None,None


def get_requestor_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

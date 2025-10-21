from urllib.parse import urljoin

from django.shortcuts import render

from blog.models import BlogDetailPage
from wagtail.models import Site


MANDILBARENG_SLUG = "mandilbareng-mardbabay-a-living-cultural-landscape"


def index(request):
    blog_page = BlogDetailPage.objects.live().filter(slug=MANDILBARENG_SLUG).first()

    blog_url = None
    if blog_page:
        blog_url = blog_page.get_full_url(request=request)

    if not blog_url:
        site = Site.find_for_request(request)
        if site:
            blog_url = urljoin(site.root_url, f"/cms/{MANDILBARENG_SLUG}/")
        else:
            blog_url = f"/cms/{MANDILBARENG_SLUG}/"

    return render(request, "home/index.html", {"blog_url": blog_url})

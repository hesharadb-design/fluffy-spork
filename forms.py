#move to 
# /venv/lib/python3.?/site-packages/wagtailcaptcha/forms.py
from __future__ import absolute_import, unicode_literals

import wagtail
from captcha.fields import ReCaptchaField


from wagtail.contrib.forms.forms import FormBuilder



class WagtailCaptchaFormBuilder(FormBuilder):
    CAPTCHA_FIELD_NAME = 'wagtailcaptcha'

    @property
    def formfields(self):
        # Add wagtailcaptcha to formfields property
        fields = super(WagtailCaptchaFormBuilder, self).formfields
        fields[self.CAPTCHA_FIELD_NAME] = ReCaptchaField(label='')

        return fields


# def remove_captcha_field(form):
#     form.fields.pop(WagtailCaptchaFormBuilder.CAPTCHA_FIELD_NAME, None)
#     form.cleaned_data.pop(WagtailCaptchaFormBuilder.CAPTCHA_FIELD_NAME, None)

import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.webkitgtk.options import Options
o=Options(); o.binary_location='/usr/lib/x86_64-linux-gnu/webkit2gtk-4.1/MiniBrowser'; o.add_argument('--automation')
d=webdriver.WebKitGTK(options=o); d.set_window_size(1280,800)
try:
  for l in ['de','it']:
    d.get(f'http://localhost:8767/?lang={l}'); time.sleep(1.5)
    try: d.find_element(By.CSS_SELECTOR,'.consent-no').click()
    except: pass
    time.sleep(0.3); d.save_screenshot(f'wk-select-{l}.png')
    print(l, d.execute_script("const s=document.querySelector('#language-select');const c=getComputedStyle(s);return [c.appearance||c.webkitAppearance, c.backgroundColor, c.color, s.value]"))
  # cambio lingua dal selettore nel motore WebKit
  from selenium.webdriver.support.ui import Select
  Select(d.find_element(By.ID,'language-select')).select_by_value('fr'); time.sleep(2)
  print('dopo cambio:', d.execute_script("return [document.documentElement.lang, document.querySelector('#hero-title').innerText.replace(/\\n/g,' '), location.search]"))
  # un solo clic sul video
  d.execute_script("document.querySelector('.big-play').scrollIntoView({block:'center'})"); time.sleep(0.3)
  d.find_element(By.CSS_SELECTOR,'.big-play').click(); time.sleep(2.5)
  print('video:', d.execute_script("const v=document.querySelector('#video-embed video');return [v.currentSrc.split('/').pop(), v.paused, +v.currentTime.toFixed(1)]"))
finally: d.quit()

import subprocess, json, re, os
REP=json.load(open('/home/claude/ilcervellocimente-sito/docs/verifica-video/collaudo-finale-45357852585.json'))
out={}
for l in ['en','fr','es','de']:
    f=f'/home/claude/ilcervellocimente-sito/assets/video/puntata-0-{l}.mp4'; D=REP['languages'][l]['duration']
    # tagli di scena / salti nella parte di Nora (9,2 s → fine-7,9 s)
    r=subprocess.run(['ffmpeg','-hide_banner','-ss','9.2','-to',str(D-7.9),'-i',f,'-vf',"select='gt(scene,0.12)',showinfo",'-f','null','-'],capture_output=True,text=True).stderr
    cuts=[round(float(x)+9.2,2) for x in re.findall(r'pts_time:([\d.]+)',r)]
    # nero e fermo immagine su tutto il filmato
    r2=subprocess.run(['ffmpeg','-hide_banner','-i',f,'-vf','blackdetect=d=0.2:pix_th=0.08,freezedetect=n=0.003:d=1.5','-an','-f','null','-'],capture_output=True,text=True).stderr
    black=re.findall(r'black_start:([\d.]+) black_end:([\d.]+)',r2)
    freeze=[(a) for a in re.findall(r'freeze_start: ([\d.]+)',r2)]
    freeze_end=re.findall(r'freeze_end: ([\d.]+)',r2)
    # OCR: un fotogramma al secondo nella parte di Nora
    os.makedirs(f'ocr-{l}',exist_ok=True)
    subprocess.run(['ffmpeg','-v','error','-y','-ss','9.6','-to',str(D-8.2),'-i',f,'-vf','fps=1',f'ocr-{l}/%03d.png'])
    texts=[]
    for p in sorted(os.listdir(f'ocr-{l}')):
        t=subprocess.run(['tesseract',f'ocr-{l}/{p}','-','--psm','11'],capture_output=True,text=True).stdout
        words=[w for w in re.findall(r'[A-Za-zÀ-ÿ]{4,}',t)]
        if words: texts.append((p,words[:6]))
    out[l]=dict(scene_cuts_in_nora=cuts,black=black,freeze_start=freeze,freeze_end=freeze_end,ocr_frames=len(os.listdir(f'ocr-{l}')),ocr_words=texts)
    print(l,json.dumps(out[l],ensure_ascii=False)[:600])
json.dump(out,open('frames.json','w'),indent=1,ensure_ascii=False)

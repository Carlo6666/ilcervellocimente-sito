import subprocess, numpy as np, json, cv2
REP=json.load(open('/home/claude/ilcervellocimente-sito/docs/verifica-video/collaudo-finale-45357852585.json'))
res={}
for l in ['en','fr','es','de']:
    f=f'/home/claude/ilcervellocimente-sito/assets/video/puntata-0-{l}.mp4'
    D=REP['languages'][l]['duration']; t0=9.2; t1=D-7.9
    X0,Y0,W,H=200,220,320,330   # area del volto
    raw=subprocess.run(['ffmpeg','-v','error','-ss',str(t0),'-to',str(t1),'-i',f,'-vf',f'crop={W}:{H}:{X0}:{Y0},format=gray','-f','rawvideo','-'],capture_output=True).stdout
    fr=np.frombuffer(raw,np.uint8).reshape(-1,H,W)
    # modello: occhi e naso del primo fotogramma (escluso la bocca)
    ref=fr[0]; ty,tx,th,tw=60,70,110,180   # occhi/naso nel ritaglio
    tpl=ref[ty:ty+th,tx:tx+tw]
    op=[];pos=[]
    for g in fr:
        r=cv2.matchTemplate(g,tpl,cv2.TM_CCOEFF_NORMED); _,mx,_,loc=cv2.minMaxLoc(r)
        dx,dy=loc[0]-tx,loc[1]-ty; pos.append(mx)
        my,mxx=ty+th+15+dy, tx+40+dx
        mouth=g[max(0,my):my+70, max(0,mxx):mxx+100].astype(np.float32)
        if mouth.size==0: op.append(np.nan); continue
        op.append(float((mouth<np.percentile(mouth,10)+1).mean()*0+mouth.std()))
    op=np.array(op); op=np.nan_to_num(op,nan=np.nanmean(op))
    a=subprocess.run(['ffmpeg','-v','error','-ss',str(t0),'-to',str(t1),'-i',f,'-ac','1','-ar','16000','-f','s16le','-'],capture_output=True).stdout
    s=np.frombuffer(a,np.int16).astype(np.float32); hop=640; n=len(s)//hop
    rms=np.log1p(np.sqrt((s[:n*hop].reshape(n,hop)**2).mean(1)))
    m=min(len(op),len(rms)); o=op[:m]; r=rms[:m]
    k=np.ones(25)/25; hp=lambda v:v-np.convolve(v,k,'same'); z=lambda v:(v-v.mean())/(v.std()+1e-9)
    oz,rz=z(hp(o)),z(hp(r)); lags=list(range(-12,13)); c=[]
    for L in lags: c.append(float(np.mean(oz[L:]*rz[:m-L])) if L>=0 else float(np.mean(oz[:m+L]*rz[-L:])))
    b=int(np.argmax(c))
    res[l]=dict(tracking_min=round(float(np.min(pos)),2),lag_frames=lags[b],lag_ms=lags[b]*40,peak=round(c[b],3),at0=round(c[12],3),curve=[round(v,2) for v in c])
    print(l,{k:v for k,v in res[l].items() if k!='curve'}); print('  ',res[l]['curve'])
json.dump(res,open('sync3.json','w'),indent=1)

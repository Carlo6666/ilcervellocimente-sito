import subprocess, numpy as np, json
REP=json.load(open('/home/claude/ilcervellocimente-sito/docs/verifica-video/collaudo-finale-45357852585.json'))
res={}
for l in ['en','fr','es','de']:
    f=f'/home/claude/ilcervellocimente-sito/assets/video/puntata-0-{l}.mp4'
    D=REP['languages'][l]['duration']; t0=9.2; t1=D-7.9
    W,H,x,y=110,60,315,395
    raw=subprocess.run(['ffmpeg','-v','error','-ss',str(t0),'-to',str(t1),'-i',f,'-vf',f'crop={W}:{H}:{x}:{y},format=gray','-f','rawvideo','-'],capture_output=True).stdout
    fr=np.frombuffer(raw,np.uint8).reshape(-1,H,W).astype(np.float32)
    # apertura della bocca: quota di pixel scuri (interno della bocca) per fotogramma
    thr=np.percentile(fr,8)
    open_=(fr<thr).mean(axis=(1,2))
    a=subprocess.run(['ffmpeg','-v','error','-ss',str(t0),'-to',str(t1),'-i',f,'-ac','1','-ar','16000','-f','s16le','-'],capture_output=True).stdout
    s=np.frombuffer(a,np.int16).astype(np.float32); hop=640; n=len(s)//hop
    rms=np.log1p(np.sqrt((s[:n*hop].reshape(n,hop)**2).mean(1)))
    m=min(len(open_),len(rms)); o=open_[:m]; r=rms[:m]
    # filtro passa-alto leggero: toglie le derive lente (movimenti della testa)
    k=np.ones(25)/25
    hp=lambda v: v-np.convolve(v,k,'same')
    z=lambda v:(v-v.mean())/(v.std()+1e-9)
    oz,rz=z(hp(o)),z(hp(r))
    lags=list(range(-12,13)); c=[]
    for L in lags:
        c.append(float(np.mean(oz[L:]*rz[:m-L])) if L>=0 else float(np.mean(oz[:m+L]*rz[-L:])))
    b=int(np.argmax(c))
    res[l]=dict(lag_frames=lags[b],lag_ms=lags[b]*40,peak=round(c[b],3),at0=round(c[12],3),at_pm4=[round(c[8],3),round(c[16],3)],edge=[round(c[0],3),round(c[-1],3)])
    print(l,res[l])
json.dump(res,open('sync2.json','w'),indent=1)

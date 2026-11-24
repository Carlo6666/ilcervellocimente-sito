import subprocess, numpy as np, json, sys
REP=json.load(open('/home/claude/ilcervellocimente-sito/docs/verifica-video/collaudo-finale-45357852585.json'))
out={}
for l in ['en','fr','es','de']:
    f=f'/home/claude/ilcervellocimente-sito/assets/video/puntata-0-{l}.mp4'
    D=REP['languages'][l]['duration']; t0=9.2; t1=D-7.9  # solo parte di Nora
    W,H=140,70; x,y=300,390
    raw=subprocess.run(['ffmpeg','-v','error','-ss',str(t0),'-to',str(t1),'-i',f,'-vf',f'crop={W}:{H}:{x}:{y},format=gray','-f','rawvideo','-'],capture_output=True).stdout
    fr=np.frombuffer(raw,np.uint8).reshape(-1,H,W).astype(np.float32)
    mot=np.abs(np.diff(fr,axis=0)).mean(axis=(1,2))
    a=subprocess.run(['ffmpeg','-v','error','-ss',str(t0),'-to',str(t1),'-i',f,'-ac','1','-ar','16000','-f','s16le','-'],capture_output=True).stdout
    s=np.frombuffer(a,np.int16).astype(np.float32)
    hop=640; n=len(s)//hop
    rms=np.sqrt((s[:n*hop].reshape(n,hop)**2).mean(1))
    env=np.abs(np.diff(rms))  # variazioni dell'audio
    m=min(len(mot),len(env)); mot=mot[:m]; env=env[:m]
    z=lambda v:(v-v.mean())/(v.std()+1e-9)
    mz,ez=z(mot),z(env)
    lags=range(-15,16); c=[]
    for L in lags:
        if L>=0: c.append(float(np.mean(mz[L:]*ez[:m-L])))
        else: c.append(float(np.mean(mz[:m+L]*ez[-L:])))
    best=max(zip(c,lags))
    # controllo: correlazione con audio rovesciato nel tempo (deve essere ~0)
    ctrl=float(np.mean(mz*ez[::-1]))
    # parlato vs bocca: energia della bocca quando c'è voce vs silenzio
    voice=rms[:m]>np.percentile(rms[:m],60); quiet=rms[:m]<np.percentile(rms[:m],20)
    out[l]=dict(frames=int(len(fr)),lag_frames=best[1],lag_ms=best[1]*40,corr=round(best[0],3),corr_lag0=round(c[15],3),control=round(ctrl,3),mouth_motion_voice=round(float(mot[voice].mean()),2),mouth_motion_quiet=round(float(mot[quiet].mean()),2))
    print(l,out[l])
json.dump(out,open('sync.json','w'),indent=1)

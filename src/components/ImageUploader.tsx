import { useState } from 'react';
import Loader from './Loader';
import { auth, storage } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

export default function ImageUploader({}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState<string | null>(null);

  const uploadFile = (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (!ev.target.files || !auth) return false;
    const file = Array.from(ev.target.files)[0];
    const ext = file.type.split('/')[1];

    const fileRef = ref(
      storage,
      `uploads/${auth.currentUser!.uid}/${Date.now()}.${ext}`
    );
    setUploading(true);

    const task = uploadBytesResumable(fileRef, file);
    task.on(
      'state_changed',
      (snapshot) => {
        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(pct);
      },
      (err) => {
        console.log(err);
      },
      () => {
        getDownloadURL(task.snapshot.ref).then((downloadURL) => {
          setDownloadURL(downloadURL);
          setUploading(false);
        });
      }
    );
  };

  return (
    <div className="box">
      <Loader show={uploading} />
      {uploading && <h3>{progress}%</h3>}
      {!uploading && (
        <>
          <label className="btn">
            🗂️ Upload your file
            <input
              type="file"
              onChange={uploadFile}
              accept="image/x-png,image/gif,image/jpeg"
            />
          </label>
          {downloadURL && (
            <code className="upload-snippet">{`![alt](${downloadURL})`}</code>
          )}
        </>
      )}
    </div>
  );
}

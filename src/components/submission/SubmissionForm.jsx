import React, { useState, useEffect } from 'react';
import { AxiosWithAuth } from '../../utils';

export function SubmissionForm(props) {
  const [image, setImage] = useState();
  const [imageURL, setImageURL] = useState('');
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [btnText, setBtnText] = useState('Submit')
  // track if the user chose a file in order to activate the submit button
  const [hasChosenFile, setHasChosenFile] = useState(false)

  const baseUrl =
    process.env.REACT_APP_FE_ENV === 'development'
      ? 'http://localhost:5000'
      : process.env.REACT_APP_BE;


  useEffect(()=>{
    setSubmitButton()
  },[isLoading, hasSubmitted]) 
  
      const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true)
        console.log("IMAGE", image.image[0].type)
        checkIfSubmissionIsImage(image)
        const toBase64 = (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
          });
        const base64Image = await toBase64(image.image[0]);
        // Changes to formData upload
        const formData = new FormData();
        formData.append('image', image.image[0]);
        formData.append('promptId', props.promptId);
        formData.append('base64Image', base64Image);
        // const config = { headers: { 'Content-Type': 'multipart/form-data'} };
        AxiosWithAuth()
          .post(`/upload`, formData)
          .then((url) => {
            setImageURL(url.data.imageUrl);
            console.log('success!');
            setIsLoading(false)
            setHasSubmitted(true)
            let date = new Date()
            localStorage.setItem('submit', date.getDate())
          })
          .catch((err) => {
            console.log('upload error', err)
            setIsLoading(false)
            setHasSubmitted(false)
            setBtnText('Try again')
          });
      };
      const handleUpload = (e) => {
        setImage({ image: e.target.files });
        // prevents the user from clicking submit until a file is added \\
        setHasChosenFile(true)
      };

  const setSubmitButton = () => {
    if(isLoading){
      setBtnText('Loading...')
    }
    if(hasSubmitted){
      setBtnText('Submitted')
    }
    if(localStorage.getItem('submit')){
      let today = new Date()
      let day = today.getDate();
      if(localStorage.getItem('submit') === day){
        setBtnText('Submitted')
        setHasSubmitted(true)
      }
    }
  }

  // check the submission to ensure it is png or jpeg
  const checkIfSubmissionIsImage = () => {
    console.log("checkIfSubmissionIsImage() invoked", image.image[0].type)
  //   let image_type = image.image[0].type
  //   if (image_type === "image/jpeg" || image_type === "image/png") {
  //   } else {
  //     alert("Please submit a jpeg or png image.")
      
  //   }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="upload-button d-flex justify-content-center">
          <label className="m-3 btn btn-outline-primary pr-5 pl-5">
            Choose a file
            <input onChange={handleUpload} type="file" id="storyImage" hidden/>
          </label>
        </div>

        {hasChosenFile === false ? "" : <div className="submit-button d-flex justify-content-center">
          <button className="m-3 btn btn-warning btn-lg pr-5 pl-5" type="submit">
              {btnText}
          </button>
        </div>}

      </form>
    </>
  );
}

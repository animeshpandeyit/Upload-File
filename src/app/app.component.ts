import { CommonModule } from '@angular/common';
import {
  HttpClient,
  HttpClientModule,
  HttpEventType,
} from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  uploadform: FormGroup;
  /* The line `selectedFiles: File = 'null';` in the code snippet is declaring a property
  `selectedFiles` of type `File` and initializing it with the string value `'null'`. This
  initialization is incorrect as `selectedFiles` is expected to hold a `File` object, not a string. */
  // selectedFiles: File = null;

  /* The line `selectedFiles: File | null = null;` in the code snippet is declaring a property named
  `selectedFiles` of type `File` or `null` and initializing it with the value `null`. This means
  that `selectedFiles` can hold either a `File` object or a `null` value. By using the union type
  `File | null`, the property is flexible enough to store either a `File` object when a file is
  selected or `null` when no file is selected. This setup allows for better handling of file
  selection scenarios within the application. */
  selectedFiles: File | null = null;

  formDataStored: any = [];

  /* The line `fileUrl: string = '';` in the code snippet is declaring a property named `fileUrl` of
  type `string` and initializing it with an empty string `''`. This property is used to store a
  constant URL value that represents the URL for the file to be uploaded in the application. */
  fileUrl: string = '';
  // above is the constant url for the file to be uploaded

  constructor(private _formBuilder: FormBuilder, private http: HttpClient) {
    this.uploadform = this._formBuilder.group({
      id: [''],
      name: [''],
      email: [''],
      file: [''],
    });

    const storedData = localStorage.getItem('uploadform');

    if (storedData) {
      this.formDataStored = JSON.parse(storedData);
      console.log('formDataStored::', this.formDataStored);
    }
  }

  ngOnInit(): void {}

  editData(id: number) {
    /* The line `const index = this.formDataStored.findIndex((item:any) => item.id === id);` is finding the
    index of an object in the `formDataStored` array based on a specific condition. */
    const confirmation = confirm('Are you sure you want to EDIT this');
    if (confirmation) {
      const index = this.formDataStored.findIndex(
        (item: any) => item.id === id
      );
      const dataToEdit = this.formDataStored[index];
      this.uploadform.patchValue(dataToEdit);
    }
  }

  updateData() {
    const confirmation = confirm('Are you sure you want to update this');

    if (confirmation) {
      const updateData = this.uploadform.value;
      const index = this.formDataStored.findIndex(
        (item: any) => item.id === updateData.id
      );
      if (index !== -1) {
        this.formDataStored[index] = updateData;
        localStorage.setItem('uploadform', JSON.stringify(this.formDataStored));
        this.uploadform.reset();
      }
    }
  }

  deleteData(id: number) {
    const index = this.formDataStored.findIndex((item: any) => item.id === id);

    const confirmation = confirm('Are you sure you want to delete this');

    if (confirmation) {
      this.formDataStored.splice(index, 1);
      localStorage.setItem('uploadform', JSON.stringify(this.formDataStored));
    }
  }

  uploadedFileNames: string[] = [];

  // uploadImage(event: any) {
  //   const file = event.currentTarget.files[0];
  //   // if (file.type === 'image/png' || 'image/jpeg') {
  //   if (file.type === 'image/png' && file.size < 600000) {
  //     const formObj = new FormData();

  //     formObj.append('file', file);
  //     this.http.post('', formObj).subscribe((response: any) => {
  //       this.uploadedFileNames.push(response);
  //       // console.log('uploadedFileNames::', this.uploadedFileNames);
  //       // this.uploadform.patchValue({
  //       //   file: this.uploadedFileNames,
  //       // });
  //       // console.log('this.uploadform::', this.uploadform);
  //       // this.uploadform.get('file')?.setValue(this.uploadedFileNames);
  //       // console.log('this.uploadform::', this.uploadform);
  //     });
  //   } else {
  //     if (file.size > 600000) {
  //       alert('Please upload a valid image file size less than 600kb');
  //     }
  //     alert('Please upload a valid image file ie png ');
  //   }
  // }

  onFileSelected(event: any) {
    console.log(event);
    this.selectedFiles = <File>event.target.files[0];
  }

  submit() {
    const formData = new FormData();
    if (this.selectedFiles) {
      // Check if a file is selected
      formData.append('file', this.selectedFiles, this.selectedFiles.name);
    }
    this.http
      .post('', formData, {
        reportProgress: true,
        observe: 'events',
      })
      .subscribe((event) => {
        if (event.type === HttpEventType.UploadProgress) {
          console.log(
            ' file upload progress :: ' +
              Math.round(event.loaded / event.total! * 100) +
              '%'
          );
        } else if (event.type === HttpEventType.Response) {
          console.log(event);
        }
      });
    const currentValue = this.uploadform.value;
    currentValue.id = this.formDataStored.length + 1;
    console.log('currentValue::', currentValue);
    this.formDataStored.push(currentValue);
    localStorage.setItem('uploadform', JSON.stringify(this.formDataStored));
    this.uploadform.reset();
  }
}

// uploadedFileNames: string[] = [];
// uploadImage(event: any) {
//   // 1. Get the selected file
//   const file = event.target.files[0];
//   // 2. Validate file type and size
//   if (!this.isValidImage(file)) {
//     return; // Early exit if file type or size is invalid
//   }
//   // 3. Create FormData object
//   const formData = new FormData();
//   formData.append('file', file);
//   // 4. Send HTTP POST request using HttpClient
//   this.http.post<string>('your-upload-endpoint', formData)
//     .subscribe(
//       (response) => {
//         // 5. Handle successful upload
//         console.log('Upload successful!', response);
//         this.uploadedFileNames.push(response); // Update filename array (assuming response contains filename)
//       },
//       (error) => {
//         // 6. Handle upload errors (optional)
//         console.error('Upload failed:', error);
//         // Consider providing user feedback or taking corrective actions
//       }
//     );
// }
// // Helper function to check valid image type and size
// isValidImage(file: File): boolean {
//   const allowedMimeTypes = ['image/png', 'image/jpeg'];
//   const isAllowedType = allowedMimeTypes.includes(file.type);
//   const isUnderSizeLimit = file.size < 600000; // Adjust size limit as needed
//   if (!isAllowedType) {
//     alert('Please upload a valid image file (PNG or JPEG)');
//   } else if (!isUnderSizeLimit) {
//     alert('Please upload an image less than 600kb');
//   }
//   return isAllowedType && isUnderSizeLimit;
// }

//

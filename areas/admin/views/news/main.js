import tinymce from 'tinymce';

tinymce.init({
  selector: '#descriptionAz',
  selector: '#descriptionDe',
  height: 500,
  plugins: 'link image table',
  toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | table',
});
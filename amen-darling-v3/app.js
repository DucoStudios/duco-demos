document.getElementById('form').addEventListener('submit',function(e){
  e.preventDefault();
  this.style.display='none';
  document.getElementById('tack').style.display='block';
});

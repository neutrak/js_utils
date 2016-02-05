//functionality to read from and store to local storage objects

var storage_supported=true;

//if this browser doesn't support (html5) local storage then remember that
if(!('localStorage' in window && (window['localStorage']!==null))){
	storage_supported=false;
}


//get the names of all the stored files
function list_files(){
	//storage not supported, give up (no files possible)
	if(!storage_supported){
		return;
	}
	
	var output_string='';
	
	//look through all the keys in the local storage object
	for(var n=0;n<localStorage.length;n++){
		key=localStorage.key(n);
		
		//name and edit functionality
		output_string+=('<a href="javascript:open_file(\''+key+'\');">'+key+'</a>');
		
		output_string+='    ';
		
		//delete functionality
		output_string+=('<a href="javascript:delete_file(\''+key+'\');">'+'[delete]'+'</a>');
		
		output_string+=('<br>'+"\n");
	}
	
	//output the file list to a pre-defined div
	document.getElementById('file_list_div').innerHTML=output_string;
}

//saves or updates a file
function save_content(){
	//storage not supported, give up (no files possible)
	if(!storage_supported){
		alert('Err: Local storage not supported (can\'t save file)');
		return;
	}
	
	//get what the user input
	var fname=document.getElementById('fname').value;
	var content=document.getElementById('content').value;
	
	if(localStorage.getItem(fname)!==null){
		if(!confirm('Confirm: Overwrite the previous file with the same name?')){
			return;
		}
	}
	
	//save it
	localStorage.setItem(fname,content);
	
	
	//update the view
	list_files();
	document.getElementById('buffer_name').innerHTML='Edit File';
}

//open a file with a given name
//to "open" means to load it into the editing area, that's all
function open_file(fname){
	//storage not supported, give up (no files possible)
	if(!storage_supported){
		alert('Err: Local storage not supported (can\'t open file)');
		return;
	}
	
	document.getElementById('fname').value=fname;
	document.getElementById('content').value=localStorage.getItem(fname);
	document.getElementById('buffer_name').innerHTML='Edit File';
}

//delete a file with a given name
function delete_file(fname){
	//storage not supported, give up (no files possible)
	if(!storage_supported){
		alert('Err: Local storage not supported (can\'t delete file); how did you get this file in the first place? extraordinary!');
		return;
	}
	
	//delete it!
	localStorage.removeItem(fname);
	
	//update the view
	list_files();
	
}

//delete all files
function delete_all_files(){
	if(confirm('Confirm: Delete all files? (you cannot undo this operation)')){
		for(var fname in localStorage){
			localStorage.removeItem(fname);
		}
	}
	
	//update the view
	list_files();
}

//clear the edit area for a new file buffer
function new_file(){
	document.getElementById('fname').value='';
	document.getElementById('content').value='';
	document.getElementById('buffer_name').innerHTML='New File';
}


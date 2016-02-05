//returns an html-friendly version of the given string
function html_sanitize(text){
	text=text.replace('<','&lt;');
	text=text.replace('>','&gt;');
	return text;
}

//pads zeros in front of a number until the number with padding has the desired number of digits
function pad_zero(digits,number){
	//the +'' is necessary to type-cast to a string, since javascript's types are super stupid
	if((number+'').length<digits){
		return pad_zero(digits,'0'+number);
	}
	return number;
}

//a clock function that is not directly related to the calendar but is nonetheless nice to have around
function start_utc_clock(clock_div_id){
	var clock_div=document.getElementById(clock_div_id);
	var d=new Date();
	clock_div.innerHTML='The UTC time is '+pad_zero(2,d.getUTCHours())+':'+pad_zero(2,d.getUTCMinutes())+':'+pad_zero(2,d.getUTCSeconds())+' on '+d.getUTCFullYear()+'-'+pad_zero(2,(d.getUTCMonth()+1))+'-'+pad_zero(2,d.getUTCDate());
	
	setTimeout(function(){start_utc_clock(clock_div_id);},1000);
}

//a structure to make some date handling easier
function month_day(year,month,day,color,text){
	this.year=year;
	this.month=month;
	this.day=day;
	this.color=color;
	this.text=text;
	
	this.user_day=false;
}

//returns the given number of days in milliseconds
function days_to_ms(days){
	return days*24*60*60*1000;
}

//toggles the presence of the given day in the list of days, returns the updated list
function toggle_day(day_list,day){
	var new_day_list=[];
	
	//look through the givne list of days
	var found=false;
	for(var i=0;i<day_list.length;i++){
		//if this was a match, then remove it (don't add it to the new list) and remember it was found
		if((day_list[i].year==day.year) && (day_list[i].month==day.month) && (day_list[i].day==day.day)){
			found=true;
		}else{
			new_day_list.push(day_list[i]);
		}
	}
	
	//if this day wasn't found, then add it (toggle)
	if(!found){
		var text=prompt('Enter event text');
		if(text!=null){
			day.text=text;
		}
		
		var color=prompt('Enter highlight color');
		if(color!=null){
			day.color=color;
		}
		
		//since the user just toggled this day, it is user-set
		day.user_day=true;
		
		new_day_list.push(day);
		
		//save this in local storage so it persists between re-loads
		var hglt_days=JSON.parse(localStorage.getItem('highlighted_days'));
		hglt_days.push(day);
		localStorage.setItem('highlighted_days',JSON.stringify(hglt_days));
//		console.log(localStorage.highlighted_days);
	//if this day WAS found, then check in the local storage object and remove it if it's there
	}else{
		var hglt_days=JSON.parse(localStorage.getItem('highlighted_days'));
		var new_hglt_days=[];
		for(var i=0;i<hglt_days.length;i++){
			if((hglt_days[i].year==day.year) && (hglt_days[i].month==day.month) && (hglt_days[i].day==day.day)){
				//this day was in the local storage, so remove it by omission
			}else{
				new_hglt_days.push(hglt_days[i]);
			}
		}
		
		//re-set local storage object to new highlight days
		localStorage.setItem('highlighted_days',JSON.stringify(new_hglt_days));
	}
	
	//return the updated list of days
	return new_day_list;
}

//determine if this year is a leap year or not
//returns TRUE if it is a leap year, else FALSE
function leap_year(year){
	//if the year is an integer multiple of 4, then it is /probably/ a leap year
	if((year/4)==Math.floor(year/4)){
		//if this is an integer multiple of 100, but NOT an integer multiple of 400
		//then it's NOT a leap year
		if(((year/100)==Math.floor(year/100)) && ((year/400)!=Math.floor(year/400))){
			return false;
		}
		
		//if we got here and didn't return then this IS a leap year
		//it's an integer multiple of 4, and doesn't fit the special exception rule
		return true;
	}
	//if we got here and didn't return then this isn't a leap year
	return false;
}

//30 days has september, april, june and november
//all the rest have 31 except februrary which sucks
function get_days_in_month(month,year){
	var day_total=0;
	switch(month){
		//Feb
		case 1:
			day_total=28;
			
			//29 days in leap years
			if(leap_year(year)){
				day_total=29;
			}
			break;
		
		//Apr, Jun, Sep, Nov
		case 3:
		case 5:
		case 8:
		case 10:
			day_total=30;
			break;
		
		//Jan, Mar, May, Jul, Aug, Oct, Dec
		case 0:
		case 2:
		case 4:
		case 6:
		case 7:
		case 9:
		case 11:
			day_total=31;
			break;
		
	}
	return day_total;
}

//gets the week index (day) of the first day in the month (index 0)
//needs a known starting point to work back from
function get_first_day_in_month(known_date,known_day){
	//go back until we get the first week
	while(known_date>6){
		known_date-=7;
	}
	
	//if the known date was within the first week and we went negative
	//then re-adjust to start from the following week (the first /real/ week)
	if(known_date<1){
		known_date+=7;
	}
	
	//go back until we get the first day within the first week
	while(known_date>1){
		known_date--;
		known_day--;
		
		//when we hit the start of a week, cycle back to the end
		if(known_day<0){
			known_day=6;
		}
	}
	
	//we should now have the day of week for the first day of the month
	//(at date 1 == known_date)
	return (known_day);
}

//gets the date of the nth occurance of the day with day_idx
//in a month that starts with day of week as first_day
//takes day of week of 1st of month as an argument
function get_n_day(first_day,day_idx,n){
	//date of first occurance of given day within month
	var first_idx_day=0;
	
	if(first_day>day_idx){
		first_idx_day=(7-(first_day-day_idx))+1;
	}else if(first_day<day_idx){
		first_idx_day=(day_idx-first_day)+1;
	}else{
		//first day of the month is a thursday already
		first_idx_day=1;
	}
	
	//now find the date for the nth occurance, given the first occurance
	if(n<1){
		n=1;
	}
	return(first_idx_day+(7*(n-1)));
}

//gets the date of the last occurance of day_idx within the given month in the given year
function get_last_day(day_idx,known_date,known_day,month,year){
	//start at the end and back up to where we should be
	var last_day=100;
	var week_idx=6;
	while(last_day>get_days_in_month(month,year)){
		last_day=get_n_day(get_first_day_in_month(known_date,known_day),day_idx,week_idx);
		
		week_idx--;
	}
	
	return last_day;
}

//cycle around months
function month_loop(month,diff){
	if((month+diff)>11){
		month=0;
	}else if((month+diff)<0){
		month=11;
	}else{
		month+=diff;
	}
	return month;
}

//check if the given day is currently within the given highlighted_days array
function is_highlighted(highlighted_days,date){
	for(var i=0;i<highlighted_days.length;i++){
		if((highlighted_days[i].year==date.year) && (highlighted_days[i].month==date.month) && (highlighted_days[i].day==date.day)){
			return true;
		}
	}
	return false;
}

//draws a calendar (table) for easy viewing
//d is the Date() object to draw for; (new Date() for right now)
//highlighted_days is an array of month_day objects
//ev_div_id is the id of the div to output events to, use '' to suppress output
function draw_calendar(cal_div,d,highlighted_days,days_var,div_id,ev_div_id){
	var modal_message='';
	
	//the date is passed as an argument so we can display any day, not just today
	
//	console.log('year is '+d.getFullYear());
//	console.log('month is '+d.getMonth());
//	console.log('date in month is '+d.getDate());
//	console.log('highlighted_days=')
//	for(var i=0;i<highlighted_days.length;i++){
//		console.log(highlighted_days[i].year+'-'+highlighted_days[i].month+'-'+highlighted_days[i].day);
//	}
	
	//event div, to display events when title is insufficient
	var ev_div=null;
	if(ev_div_id!=''){
		ev_div=document.getElementById(ev_div_id);
		ev_div.innerHTML='';
		ev_div.style='margin-left:auto; margin-right:auto; font-size:12px; text-align:left; width:250px;';
	}
	
	//today's date gets special treatment
	var todays_date=new Date();
	
	//get the number of days in the current month
	var day_count=get_days_in_month(d.getMonth(),d.getFullYear());
	
	//now get what the first day in the month was, as a day of the week
	var first_day=get_first_day_in_month(d.getDate(),d.getDay());
	
	//which day we're on within the month
	var day=1;
	
	//now create a table, with (day_count+first_day)/7 rows and 7 columns
	var rows=Math.ceil((day_count+first_day)/7);
	var cols=7;
	
//	var html_string='<span style=\'text-align:center;\'><b>'+pad_zero(4,d.getFullYear())+'-'+pad_zero(2,(d.getMonth()+1))+'-'+pad_zero(2,(d.getDate()))+'</b></span>'+"\n";
	var html_string='<span style=\'text-align:center;\'><b>'+pad_zero(4,d.getFullYear())+'-'+pad_zero(2,(d.getMonth()+1))+'</b></span>'+"\n";
	
	html_string+='<table style="border:1px solid black; margin-left:auto; margin-right:auto;">'+"\n";
	html_string+='<tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr>';
	for(var r=0;r<rows;r++){
		html_string+='<tr>'+"\n";
		for(var c=0;c<cols;c++){
			html_string+='<td style="border:1px solid black;">'+"\n";
			
			if((day<=day_count) && ((r>0) || (c>=first_day))){
				var highlight=false;
				var highlight_color='#ffff00';
				var highlight_text='';
				var border_text='';
				
				//highlight the active/reference day (initially today)
/*
				if((d.getDate())==day){
					highlight=true;
					highlight_color='#00ff00';
					highlight_text='active day';
				}
*/
				if((d.getDate())==day){
					border_text='border: 2px solid gray;';
				}
				
				//did the user highlight this day manually? (if so, they can delete it)
				var user_highlight=false;
				
				//highlight days which are in the highlighted_days list
				for(var i=0;i<highlighted_days.length;i++){
					if((highlighted_days[i].year==d.getFullYear()) && (highlighted_days[i].month==(d.getMonth()+1)) && (highlighted_days[i].day==day)){
						if(!highlight){
							user_highlight=highlighted_days[i].user_day;
							highlight_color=highlighted_days[i].color;
							highlight_text=highlighted_days[i].text;
						}else{
							highlight_text+=' - '+highlighted_days[i].text;
						}
						highlight=true;
					}
				}
				
				//TODO: generalize this better; hopefully we can avoid taking in the strings for global variable names... (days_var is the text name corresponding to a global)
				
//				if((!highlight) || (user_highlight==true)){
					html_string+='<span onclick="javascript:'+
						days_var+'=toggle_day('+days_var+
						',new month_day('+d.getFullYear()+','+(d.getMonth()+1)+','+day+',\'#ffff00\',\'user-selected day\'));'+
						'draw_calendar(document.getElementById(\''+div_id+'\'),'+
						'new Date(\''+(d.toString())+'\'),'+
						days_var+',\''+days_var+'\',\''+div_id+'\',\''+ev_div_id+'\');"';
				//highlighted days aren't clickable, since that would remove existing highlights
//				}else{
//					html_string+='<span ';
//				}
				
				var today=false;
				
				//for "today" throw a border around it
				if((d.getFullYear()==todays_date.getFullYear()) && (d.getMonth()==todays_date.getMonth()) && (day==todays_date.getDate())){
					border_text='border: 2px solid black;';
					today=true;
				}
				
				if(highlight){
					html_string+='style="background:'+highlight_color+';'+border_text+'" ';
					if(highlight_text!=''){
						html_string+=' title="'+highlight_text+'"';
					}
					
					//if we were asked to output events to a div, then do that here
					if(ev_div_id!=''){
						ev_div.innerHTML+='<b>'+pad_zero(4,d.getFullYear())+'-'+pad_zero(2,(d.getMonth()+1))+'-'+pad_zero(2,day)+'</b> : '+
							html_sanitize(highlight_text)+(user_highlight?' <b>(user-set)</b> ':' ')+'<br>';
						
						//add today's events to the top, in addition to the normal in-order display at the bottom
						//note that adding to the front would normally reverse the output,
						//but so long as "today" is unique within a month only <=1 entry will ever exist
						if(today){
							ev_div.innerHTML='<b>TODAY: '+html_sanitize(highlight_text)+'</b><hr>'+ev_div.innerHTML;
						}
					}
					
					//if "today" was highlighted then alert the user to any events happening today
					if(today){
//						alert('TODAY: '+html_sanitize(highlight_text));
						html_string='<span id=\'today_notify\' onclick=\'javascript:document.getElementById("today_notify").innerHTML="";\' title=\'click to dismiss\'><b>TODAY: '+
							html_sanitize(highlight_text)+'</b><br>[click to dismiss]<br></span>'+html_string;
					}
					
				//for "today" highlight it in green if it wasn't already highlighted
				}else if(today){
					highlight_color='#00ff00';
					html_string+='style="'+border_text+'background:'+highlight_color+';"';
					html_string+=' title="'+'today'+'"';
				}else if(border_text!=''){
					html_string+='style="'+border_text+'"';
				}
				
				html_string+='>';
				
				html_string+=(day+'');
				
				html_string+='</span>';
				
				
				day++;
			}
			
			html_string+='</td>'+"\n";
		}
		html_string+='</tr>'+"\n";
	}
	html_string+='</table>'+"\n";
	
	//output the table to the given div
	cal_div.innerHTML=html_string;
}


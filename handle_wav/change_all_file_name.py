import os

data_path = "./data/jsut/"
all_files_name = os.listdir(data_path)

for i, filename in enumerate(all_files_name):

	# target_file_name = ""
	# if filename.startswith(target_file_name):
		# os.rename(filename, i + ".wav")

	str_i = str(i+1)

	if len(str_i) == 1:
		num = "000" + str_i
	elif len(str_i) == 2:
		num = "00" + str_i
	elif len(str_i) == 3:
		num = "0" + str_i
	else:
		num = str_i

	os.rename(data_path + filename, data_path + "jsut_" + num + ".wav")
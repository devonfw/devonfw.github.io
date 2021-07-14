#!/bin/sh

SETUP_FILE="/root/setup/setup.txt"
STATUS_FILE="/root/setup/status.txt"
#wait until setup.txt is loaded in katacoda
while [ ! -f $SETUP_FILE ]
do 
	sleep 1
done

#increase swap size by 8 GB by adding a new swap file
mkdir /root/dev
fallocate -l 8G /root/dev/md-0
chmod 600 /root/dev/md-0
mkswap /root/dev/md-0
swapon /root/dev/md-0

#loop through setup.txt and execute the configured scripts
STEPS=$(head $SETUP_FILE -n1)
i=1
while [ "$i" -le $STEPS ]; do
	NAME_LINE=$((i * 3))
	SCRIPT_LINE=$((i * 3 + 1))
	NAME=$(head $SETUP_FILE -n$NAME_LINE | tail -n1)
	COMMAND=$(head $SETUP_FILE -n$SCRIPT_LINE | tail -n1)
	#write name of the current step in status file and execute the script
	echo "$NAME" > $STATUS_FILE
	sh "/root/setup/$COMMAND"

	i=$(( i + 1 ))
done

#write 'Finished' in status file
#the setup script checks the status file for this string
echo "Finished" > $STATUS_FILE

echo 'export NG_CLI_ANALYTICS=CI' >> /root/.profile

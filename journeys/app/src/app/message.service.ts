import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  messages: string[] = [];

  constructor() { }

  add(message: string): void{
    this.messages.push(message);
  }

  clear(): void {
    this.messages = [];
  }

  get(): string[] {
    return this.messages;
  }

  log(msg:string): void{
    console.log(msg);

  }
}

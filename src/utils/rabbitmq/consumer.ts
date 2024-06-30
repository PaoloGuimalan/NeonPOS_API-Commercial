require("dotenv").config();
import amqp from "amqplib";
import config from "../constants/config";
const POD_NAME = process.env.POD_NAME || "podless";

//step 1 : Connect to the rabbitmq server
//step 2 : Create a new channel
//step 3 : Create the exchange
//step 4 : Create the queue
//step 5 : Bind the queue to the exchange
//step 6 : Consume messages from the queue

export default async function consumeMessages() {
  try{
    const connection = await amqp.connect(config.rabbitMQ.url);
    const channel = await connection.createChannel();
  
    await channel.assertExchange(config.rabbitMQ.exchangeName, "fanout");
  
    const q = await channel.assertQueue("");
  
    await channel.bindQueue(q.queue, config.rabbitMQ.exchangeName, "");
  //   await channel.bindQueue(q.queue, config.rabbitMQ.exchangeName, "INFO");
  //   await channel.bindQueue(q.queue, config.rabbitMQ.exchangeName, "WARNING");
  //   await channel.bindQueue(q.queue, config.rabbitMQ.exchangeName, "ERROR");
  
    channel.consume(q.queue, (msg: any) => {
      const data = JSON.parse(msg.content);
      channel.ack(msg);

      if(data.pod !== POD_NAME && data.logType === "INFO:NEONPOS_API"){
        console.log(data);
      }
      else if(data.pod !== POD_NAME && data.logType === "WARNING:NEONPOS_API"){
        console.log(data);
      }
      else if(data.pod !== POD_NAME && data.logType === "ERROR:NEONPOS_API"){
        console.log(data);
      }
    });
  }catch(ex){
    console.log("Unable to connect message broker");
  }
}
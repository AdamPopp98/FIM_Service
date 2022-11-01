//use std::net::TcpListener;
//use std::net::TcpStream;
//use std::io::prelude::*;
use std::{error::Error, time::Duration};
use warp::{reply::Json, Filter};
use serde_json::json;
use tokio::time::sleep;

//extern crate redis;
use redis::{
    streams::{StreamRangeReply, StreamReadOptions, StreamReadReply},
    AsyncCommands, Client,
};
//use chrono::Utc;

/*extern crate serde_json;
extern crate serde;

#[macro_use]
extern crate serde_derive;

#[derive(Serialize, Deserialize)]
struct SigninRequest
{
    domain: String,
    username: String,
    timestamp: i64
}*/



#[tokio::main]
async fn main()-> Result<(), Box<dyn Error>> {
    let client = Client::open("redis://127.0.0.1/")?;
    let mut con = client.get_tokio_connection().await?;
    con.set("my_key", "Hello world").await?;
    let result: String = con.get("my_key").await?;
    println!("->> my_key: {}\n", result);
    con.del("my_key").await?;
    println!("->> Done");
    //let hello_world = warp::path::end().map(|| "Hello world from root!");

    //let hi = warp::path("hi").map(|| "Hello from hi");

    //let routes = hello_world.or(externalRequest());

    //println!("starting web-server");
    //warp::serve(routes).run(([127, 0, 0, 1], 8080)).await;

    Ok(())
}

fn connectToRedis() -> redis::RedisResult<()>
{
    let client = redis::Client::open("redis://127.0.0.1/")?;
    let mut con = client.get_connection()?;
    Ok(())
}

fn externalRequest(
) -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone {
    warp::path("domainSignin")
        .and(warp::get())
        .and(warp::path::param())
        .and_then(queryDatabase)
}

async fn queryDatabase(username: String) -> Result<Json, warp::Rejection>
{
    let response = json!([
        {"accepted": true, "listenOn": 8081, "username": username}
    ]);
    let response = warp::reply::json(&response);
    Ok(response)
}
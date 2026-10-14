const { Client, GatewayIntentBits, Partials } = require("discord.js");

const ZestyAPI = require("@re621/zestyapi");
const path = require("path");
const fs = require("fs");
const { json } = require("stream/consumers");

const E621 = ZestyAPI.connect({
    userAgent: "yuh/test"
});

E621.login({
    username: "",
    apiKey: ""
});

const Efav = ZestyAPI.connect({
    userAgent: "fav/test"
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessageReactions 
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction
    ]
});

let isChecking = false;

async function checkArtistPosts() {
    if (isChecking) { return };
    isChecking = true;
    let filePath = path.join(__dirname, "data", "artists.json")
    let artists = JSON.parse(fs.readFileSync(filePath, "utf8"));

    try {
        for (let [artist,data] of Object.entries(artists)) {

            let result = await E621.Posts.find({
                tags: `${artist}`,
                limit: 1
            });
            let newPosts = result.data.filter(
                post => post.id > data.lastPostId
            );
            console.log(artist + ` new posts: ` + newPosts.length)

            if (!(newPosts.length > 0)) continue;

            result = await E621.Posts.find({
                tags: `${artist}`,
                limit: 100
            });
            newPosts = result.data.filter(
                post => post.id > data.lastPostId
            );

            newPosts.reverse();

            for (const post of newPosts) {
                console.log(`NEW POST!!!!-------------------------------------------------------`)
                console.log(artist)
                console.log(data.channel)
                console.log(post.id)
                console.log(`-------------------------------------------------------------------`)
                data.lastPostId = post.id;

                const unembeddedDescription = post.description.replace(
                    /(https?:\/\/[^\s]+)/g,
                    '<$1>'
                );

                let post_parent = ``;

                if (post.relationships.parent_id != (null || undefined)) {
                    post_parent = `Parent: <https://e621.net/posts/${post.relationships.parent_id}>\n`
                }

                let msg;

                const channel = await client.channels.fetch(data.channel);
                if (data.istag === true) {
                    let finalcontent = ``;
                    let preparecontent = `New post under the tag **${artist}**!\n` +
                    `By the artist **${post.uploader_name}**!\n` +
                    `File: ${post.file.url}\n` +
                    `Post: <https://e621.net/posts/${post.id}>\n` +
                    post_parent +
                    `Created at: ${post.created_at}\n\n` +
                    `Description: ` + unembeddedDescription
                    if (preparecontent.length > 2000) {
                        finalcontent = preparecontent.substring(0, 1950) + `\n\n Couldn't fit full description, check the post`
                    } else {
                        finalcontent = preparecontent
                    }

                    msg = await channel.send({
                    content: finalcontent
                    });
                } else {
                    let finalcontent = ``;
                    let preparecontent = `@everyone\n` +
                    `New post by **${artist}**!\n` +
                    `File: ${post.file.url}\n` +
                    `Post: <https://e621.net/posts/${post.id}>\n` +
                    post_parent +
                    `Created at: ${post.created_at}\n\n` +
                    `Description: ` + unembeddedDescription
                    if (preparecontent.length > 2000) {
                        finalcontent = preparecontent.substring(0, 1950) + `\n\n Couldn't fit full description, check the post`
                    } else {
                        finalcontent = preparecontent
                    }

                    msg = await channel.send({
                    content: finalcontent
                    });
                }
                await msg.react("⭐");
                // await msg.react("👍");
            }

            fs.writeFileSync(
                filePath,
                JSON.stringify(artists, null, 2)
            );

        }
    } catch (err) {
        console.error(err);
    } finally {
        isChecking = false;
    }
}

client.once("clientReady", () => {
    console.log(`Logged in as ${client.user.tag}`);

    checkArtistPosts(); // run immediately
    setInterval(checkArtistPosts, 5 * 1000); // every 5 min 5 * 60 * 1000
});

client.on("messageReactionAdd", async (reaction, user) => {
    (async () => {
        if (user.bot) return;
        if (reaction.emoji.name !== "⭐") return;
        if (user.id !== "1452297863039287483") return;

        if (reaction.partial) {
        try { await reaction.fetch(); } catch (err) { console.error("Failed to fetch reaction:", err); return; }
        }

        if (reaction.message.partial) {
        try { await reaction.message.fetch(); } catch (err) { console.error("Failed to fetch message:", err); return; }
        }

        if (reaction.message.author.id !== "1513848579385589851") return;

        console.log("Favorite requested!");

        let filePath = path.join(__dirname, "data", "accounts.json")
        let accounts = JSON.parse(fs.readFileSync(filePath, "utf8"));

        if (!accounts[user.id]) {whoto = user; await whoto.send({content: `You didnt login to favourite posts.`}); return}

        Efav.login({
            username: accounts[user.id]["username"],
            apiKey: accounts[user.id]["token"]
        });
        let id = ``
        reaction.message.content.replace(/(https:\/\/e621.net\/posts\/(\d+))/, function(match, url, postId) { id = postId; console.log(`Found post ID: ${id}`); });
        if (id === ``) {
            console.log(`No post found...`)
            return
        }
        console.log(`Adding post ${id} to favorites...`);
        await Efav.Favorites.add(id);
        Efav.logout()
        console.log(`Done!`);
    })();
});

client.on("messageReactionRemove", async (reaction, user) => {
    (async () => {
        if (user.bot) return;
        if (reaction.emoji.name !== "⭐") return;
        if (user.id !== "1452297863039287483") return;

        if (reaction.partial) {
        try { await reaction.fetch(); } catch (err) { console.error("Failed to fetch reaction:", err); return; }
        }

        if (reaction.message.partial) {
        try { await reaction.message.fetch(); } catch (err) { console.error("Failed to fetch message:", err); return; }
        }

        if (reaction.message.author.id !== "1513848579385589851") return;

        console.log("Favorite requested!");

        let filePath = path.join(__dirname, "data", "accounts.json")
        let accounts = JSON.parse(fs.readFileSync(filePath, "utf8"));

        if (!accounts[user.id]) {whoto = user; await whoto.send({content: `You didnt login to unfavourite posts.`}); return}

        Efav.login({
            username: accounts[user.id]["username"],
            apiKey: accounts[user.id]["token"]
        });
        let id = ``
        reaction.message.content.replace(/(https:\/\/e621.net\/posts\/(\d+))/, function(match, url, postId) { id = postId; console.log(`Found post ID: ${id}`); });
        if (id === ``) {
            console.log(`No post found...`)
            return
        }
        console.log(`Removing post ${id} from favorites...`);
        await Efav.Favorites.remove(id);
        Efav.logout()
        console.log(`Done!`);
    })();
});


client.on("interactionCreate", async interaction => {
  if ((!interaction.isChatInputCommand()) && (!interaction.isMessageContextMenuCommand())) { return }
  
  if (interaction.commandName === "Favourite") {
        try {
        if (interaction.options.data[0].message.author.id !== "1513848579385589851") return;
        (async () => {
            const target = interaction.options.data[0].message.content;
            let filePath = path.join(__dirname, "data", "accounts.json")
            let accounts = JSON.parse(fs.readFileSync(filePath, "utf8"));

            await interaction.deferReply({ephemeral: true});

            Efav.login({
                username: accounts[interaction.user.id]["username"],
                apiKey: accounts[interaction.user.id]["token"]
            });
            let id = ``
            target.replace(/(https:\/\/e621.net\/posts\/(\d+))/, function(match, url, postId) { id = postId; console.log(`Found post ID: ${id}`); });

            console.log(`Adding post ${id} to favorites...`);
            await Efav.Favorites.add(id);
            Efav.logout()
            console.log(`Done!`);
            await interaction.editReply({
                content: `Favorited post ` + id
            });
        })();
    } catch (err) { console.error(err); }
  }

  if (interaction.commandName === "fav") {
    try {
        const id = interaction.options.getInteger("id");
        (async () => {
            console.log(`Adding post ${id} to favorites...`);
            let filePath = path.join(__dirname, "data", "accounts.json")
            let accounts = JSON.parse(fs.readFileSync(filePath, "utf8"));

            Efav.login({
                username: accounts[interaction.user.id]["username"],
                apiKey: accounts[interaction.user.id]["token"]
            });
            await Efav.Favorites.add(id);
            Efav.logout()
            console.log(`Done!`);
        })();
    } catch (err) { console.error(err); }
  }

  if (interaction.commandName === "login") {
    const user = interaction.options.getString("username");
    const token = interaction.options.getString("token");
    try {
        let filePath = path.join(__dirname, "data", "accounts.json")
        let accounts = JSON.parse(fs.readFileSync(filePath, "utf8"));

        await interaction.deferReply({ephemeral: true});

        accounts[interaction.user.id] = { username: user, token: token };
        fs.writeFile(filePath, JSON.stringify(accounts, null, 2), (err) => {
            if (err) console.error(err);
        });

        await interaction.editReply({
            content: `Successfully saved account for ` + interaction.user.id + ` as:` + `\nUsername: ` + user + `\nToken: ` + token
        });
    } catch (err) { console.error(err); }
  }

  if (interaction.commandName === "getpost") {
    try {
        const id = interaction.options.getInteger("id");
        const info = interaction.options.getBoolean("info");
        (async () => {

            await interaction.deferReply();

            const result = await E621.Posts.get(id);

            let post = result.data[0];

            //let alllinks = [];

            // post.description.replace(/https?:\/\/[^\s]+/g, function (url) {
            //     alllinks.push(url);
            // });

            const unembeddedDescription = post.description.replace(
                /(https?:\/\/[^\s]+)/g,
                '<$1>'
            );

            let post_parent = ``;

            if (post.relationships.parent_id != (null || undefined)) {
                post_parent = `Parent: <https://e621.net/posts/${post.relationships.parent_id}>\n`
            }

            //let msg;

            //const channel = await client.channels.fetch(data.channel);

            console.log(post);//.file.url);

            let finalcontent = post.file.url;

            //let buttons = []

            if (info === true) {
                let preparecontent = `Post by the artist **${post.uploader_name}**!\n` +
                `File: ${post.file.url}\n` +
                `Post: <https://e621.net/posts/${post.id}>\n` +
                post_parent +
                `Created at: ${post.created_at}\n\n` +
                `Description: ` + unembeddedDescription
                if (preparecontent.length > 2000) {
                    finalcontent = preparecontent.substring(0, 1950) + `\n\n Couldn't fit full description, check the post`
                } else {
                    finalcontent = preparecontent
                }
            }

            if (post.file.url === null) {
                await interaction.editReply({
                    content: `Post no longer exists.`
                });
                return
            }

            await interaction.editReply({
                content: finalcontent
            });
        })();
    } catch (err) {
        console.error(err);
    }
  }
});

client.login("");
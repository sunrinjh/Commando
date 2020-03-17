const { oneLine } = require('common-tags');
const Command = require('../base');

module.exports = class PingCommand extends Command {
	constructor(client) {
		super(client, {
			name: '핑',
			group: 'util',
			aliases: ['ping'],
			memberName: 'ping',
			description: '봇의 핑을 알려줍니다.',
			throttling: {
				usages: 5,
				duration: 10
			}
		});
	}

	async run(msg) {
		const pingMsg = await msg.reply('핑...');
		return pingMsg.edit(oneLine`
			${msg.channel.type !== 'dm' ? `${msg.author},` : ''}
			퐁! 이 메세지는 주고 받는데 ${
				(pingMsg.editedTimestamp || pingMsg.createdTimestamp) - (msg.editedTimestamp || msg.createdTimestamp)
			} ms 가 걸렸습니다.
			${this.client.ws.ping ? `핑은 ${Math.round(this.client.ws.ping)} ms 입니다.` : ''}
		`);
	}
};

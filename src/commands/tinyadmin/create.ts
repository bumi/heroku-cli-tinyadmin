import {Command, flags} from '@heroku-cli/command'
import * as Heroku from '@heroku-cli/schema'
import {HTTP} from 'http-call'

export default class Create extends Command {
  static topic = 'tinyadmin'

  static description = 'create a tinyadmin dashboard for the attached database'

  static flags = {
    app: flags.app({required: true}),
    config: flags.string({required: false, description: 'config variable name. default: DATABASE_URL'}),
    apiKey: flags.string({required: false}),
  }

  async run() {
    const {flags} = this.parse(Create)
    const {body: config} = await this.heroku.get<Heroku.ConfigVars>(`/apps/${flags.app}/config-vars`)
    const databaseUri = config[flags.config || 'DATABASE_URL']
    const tinyadminApiKey = flags.apiKey || config.TINYADMIN_KEY
    await HTTP.post('https://tinyadmin.herokuapp.com/api/connections', {
      body: {connection: {uri: databaseUri, name: flags.app}},
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: tinyadminApiKey,
      },
    })
    this.log('tinyadmin successfully created.')
    this.log('')
    this.log('Access your admin dashboard:')
    this.log('$ heroku addons:open tinyadmin')
  }
}

import type { InitConfig } from '@aries-framework/core'

import { Agent, 
          WsOutboundTransport, 
          HttpOutboundTransport , 
          KeyDerivationMethod, 
          ConsoleLogger, 
          LogLevel,
          ConnectionEventTypes,
          ConnectionStateChangedEvent,
          DidExchangeState,
          OutOfBandRecord} from '@aries-framework/core'

import { agentDependencies, HttpInboundTransport } from '@aries-framework/node'


const initializeAcmeAgent = async () => {
  // Simple agent configuration. This sets some basic fields like the wallet
  // configuration and the label.
  const config: InitConfig = {
    label: 'demo-agent-acme',
    walletConfig: {
      id: 'mainAcme',
      key: 'demoagentacme0000000000000000000',
    },
    autoAcceptConnections: true,
    endpoints: ['http://localhost:3001'],
  }

  // A new instance of an agent is created here
  const agent = new Agent({ config, dependencies: agentDependencies })

  // Register a simple `WebSocket` outbound transport
  agent.registerOutboundTransport(new WsOutboundTransport())

  // Register a simple `Http` outbound transport
  agent.registerOutboundTransport(new HttpOutboundTransport())

  // Register a simple `Http` inbound transport
  agent.registerInboundTransport(new HttpInboundTransport({ port: 3001 }))

  // Initialize the agent
  await agent.initialize()

  return agent
}

const createNewInvitation = async (agent: Agent) => {
  const outOfBandRecord = await agent.oob.createInvitation()

  return {
    invitationUrl: outOfBandRecord.outOfBandInvitation.toUrl({ domain: 'https://0f1d-195-13-40-70.eu.ngrok.io' }),
    outOfBandRecord,
  }
}

const createLegacyInvitation = async (agent: Agent) => {
  const { invitation } = await agent.oob.createLegacyInvitation()

  return invitation.toUrl({ domain: 'https://0f1d-195-13-40-70.eu.ngrok.io' })
}


const setupConnectionListener = (agent: Agent, outOfBandRecord: OutOfBandRecord, cb: (...args: any) => void) => {
  console.log(`In setup connection listener`)

  agent.events.on<ConnectionStateChangedEvent>(ConnectionEventTypes.ConnectionStateChanged, ({ payload }) => {
    console.log(`Connection state changed event`)

    if (payload.connectionRecord.outOfBandId !== outOfBandRecord.id) {
      console.log(`Out of band ids did not match`)

      return
    }
    if (payload.connectionRecord.state === DidExchangeState.Completed) {
      // the connection is now ready for usage in other protocols!
      console.log(`Connection for out-of-band id ${outOfBandRecord.id} completed`)

      // Custom business logic can be included here
      // In this example we can send a basic message to the connection, but
      // anything is possible
      cb()

      // We exit the flow
      process.exit(0)
    }
  })
}

const run = async () => {
  console.log('Initializing Acme agent...')
  const acmeAgent = await initializeAcmeAgent()

  console.log('Creating the invitation as Acme...')
  const { outOfBandRecord, invitationUrl } = await createNewInvitation(acmeAgent)
  //const  invitationUrl  = await createLegacyInvitation(acmeAgent)

  console.log(invitationUrl)
  console.log('Listening for connection changes...')
  setupConnectionListener(acmeAgent, outOfBandRecord, () =>
    console.log('We now have an active connection to use in the following tutorials')
  )

}

export default run

void run()*/

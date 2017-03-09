import React from 'react'
import { Card, Icon, Image } from 'semantic-ui-react'

class PlayerCard extends React.Component {

  render() {
    return(
      <Card>
        <Image src={this.props.image} />
        <Card.Content>
          <Card.Header>
            {this.props.playerName}
          </Card.Header>
        </Card.Content>
      </Card>
    )
  }
}


export default PlayerCard;
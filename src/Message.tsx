import PropTypes from 'prop-types'
import React from 'react'
import { View, ViewPropTypes, StyleSheet, ViewStyle } from 'react-native'

import Avatar from './Avatar'
import Bubble from './Bubble'
import SystemMessage from './SystemMessage'
import Day from './Day'

import { isSameUser } from './utils'
import { IMessage, User, LeftRightStyle } from './types'

const styles = {
  left: StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'flex-start',
      marginLeft: 8,
      marginRight: 0,
    },
  }),
  right: StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      marginLeft: 0,
      marginRight: 8,
    },
  }),
}

interface MessageProps<TMessage extends IMessage = IMessage> {
  key: any
  showUserAvatar?: boolean
  position: 'left' | 'right'
  currentMessage?: TMessage
  nextMessage?: TMessage
  previousMessage?: TMessage
  user: User
  inverted?: boolean
  containerStyle?: LeftRightStyle<ViewStyle>
  renderBubble?(props: Bubble['props']): React.ReactNode
  renderDay?(props: Day['props']): React.ReactNode
  renderSystemMessage?(props: SystemMessage['props']): React.ReactNode
  renderAvatar?(props: Avatar['props']): React.ReactNode
}

export default class Message extends React.Component<MessageProps> {
  static defaultProps = {
    renderAvatar: undefined,
    renderBubble: null,
    renderDay: null,
    renderSystemMessage: null,
    position: 'left',
    currentMessage: {},
    nextMessage: {},
    previousMessage: {},
    user: {},
    containerStyle: {},
    showUserAvatar: false,
    inverted: true,
  }

  static propTypes = {
    renderAvatar: PropTypes.func,
    showUserAvatar: PropTypes.bool,
    renderBubble: PropTypes.func,
    renderDay: PropTypes.func,
    renderSystemMessage: PropTypes.func,
    position: PropTypes.oneOf(['left', 'right']),
    currentMessage: PropTypes.object,
    nextMessage: PropTypes.object,
    previousMessage: PropTypes.object,
    user: PropTypes.object,
    inverted: PropTypes.bool,
    containerStyle: PropTypes.shape({
      left: ViewPropTypes.style,
      right: ViewPropTypes.style,
    }),
  }

  shouldComponentUpdate(nextProps: MessageProps) {
    const next = nextProps.currentMessage!
    const current = this.props.currentMessage!
    const { previousMessage, nextMessage } = this.props;
    const nextPropsMessage = nextProps.nextMessage
    const nextPropsPreviousMessage = nextProps.previousMessage;
    return (
      next.sent !== current.sent ||
      next.received !== current.received ||
      next.pending !== current.pending ||
      next.createdAt !== current.createdAt ||
      next.text !== current.text ||
      next.image !== current.image ||
      next.video !== current.video ||
      next.audio !== current.audio ||
      previousMessage !== nextPropsPreviousMessage ||
      nextMessage !== nextPropsMessage
    )
  }

  renderDay() {
    if (this.props.currentMessage && this.props.currentMessage.createdAt) {
      const { containerStyle, ...props } = this.props
      if (this.props.renderDay) {
        return this.props.renderDay(props)
      }
      return <Day {...props} />
    }
    return null
  }

  renderBubble() {
    const { containerStyle, ...props } = this.props
    if (this.props.renderBubble) {
      return this.props.renderBubble(props)
    }
    return <Bubble {...props} />
  }

  renderSystemMessage() {
    const { containerStyle, ...props } = this.props

    if (this.props.renderSystemMessage) {
      return this.props.renderSystemMessage(props)
    }
    return <SystemMessage {...props} />
  }

  renderAvatar() {
    const { user, currentMessage, showUserAvatar } = this.props

    if (
      user &&
      user._id &&
      currentMessage &&
      user._id === currentMessage.user._id &&
      !showUserAvatar
    ) {
      return null
    }

    if (currentMessage && currentMessage.user.avatar === null) {
      return null
    }

    const { containerStyle, ...props } = this.props
    return <Avatar {...props} />
  }

  render() {
    const { currentMessage, nextMessage, position, containerStyle } = this.props
    if (currentMessage) {
      const sameUser = isSameUser(currentMessage, nextMessage!)
      return (
        <View>
          {this.renderDay()}
          {currentMessage.system ? (
            this.renderSystemMessage()
          ) : (
            <View
              style={[
                styles[position].container,
                { marginBottom: sameUser ? 2 : 10 },
                !this.props.inverted && { marginBottom: 2 },
                containerStyle && containerStyle[position],
              ]}
            >
              {this.props.position === 'left' ? this.renderAvatar() : null}
              {this.renderBubble()}
              {this.props.position === 'right' ? this.renderAvatar() : null}
            </View>
          )}
        </View>
      )
    }
    return null
  }
}

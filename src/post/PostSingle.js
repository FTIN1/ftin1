import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import api from '../steemAPI';
import * as postActions from './postActions';
import { closePostModal } from '../actions';
import PostSingleModal from './PostSingleModal';
import PostSinglePage from './PostSinglePage';
import * as reblogActions from '../app/reblog/reblogActions';
import * as commentsActions from '../comments/commentsActions';
import * as bookmarkActions from '../bookmarks/bookmarksActions';

@connect(
  ({ posts, app, reblog, auth, bookmarks }) => ({
    content: app.lastPostId ? posts[app.lastPostId] : {},
    isPostModalOpen: app.isPostModalOpen,
    lastPostId: app.lastPostId,
    sidebarIsVisible: app.sidebarIsVisible,
    reblogList: reblog,
    bookmarks,
    auth,
  }),
  (dispatch, ownProps) => bindActionCreators({
    reblog: reblogActions.reblog,
    closePostModal: closePostModal,
    getContent: () => postActions.getContent(
      ownProps.params.author,
      ownProps.params.permlink
    ),
    openCommentingDraft: commentsActions.openCommentingDraft,
    closeCommentingDraft: commentsActions.closeCommentingDraft,
    likePost: (id) => postActions.votePost(id),
    unlikePost: (id) => postActions.votePost(id, 0),
    dislikePost: (id) => postActions.votePost(id, -1000),
    toggleBookmark: bookmarkActions.toggleBookmark,
  }, dispatch)
)
export default class PostSingle extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    if (!this.props.modal) {
      this.props.getContent();
    }
  }

  handlePageClick(e) {
    e.stopPropagation();
    this.props.closeCommentingDraft();
  }

  render() {
    const { modal, isPostModalOpen, sidebarIsVisible, content, reblog, reblogList, auth } = this.props;
    const isPostLiked =
      auth.isAuthenticated &&
      content.active_votes &&
      content.active_votes.some(vote => vote.voter === auth.user.name && vote.percent > 0);

    const isPostDisliked =
      auth.isAuthenticated &&
      content.active_votes &&
      content.active_votes.some(vote => vote.voter === auth.user.name && vote.percent < 0);

    const openCommentingDraft = () => this.props.openCommentingDraft({
      parentAuthor: content.author,
      parentPermlink: content.permlink,
      category: content.category,
      id: content.id,
    });

    return (
      <div onClick={e => this.handlePageClick(e)}>
        { (modal && isPostModalOpen) &&
          <PostSingleModal
            content={content}
            sidebarIsVisible={sidebarIsVisible}
            closePostModal={this.props.closePostModal}
            route={this.props.route}
            reblog={() => reblog(content.id)}
            isReblogged={reblogList.includes(content.id)}
            openCommentingDraft={openCommentingDraft}
            likePost={() => this.props.likePost(content.id)}
            unlikePost={() => this.props.unlikePost(content.id)}
            dislikePost={() => this.props.dislikePost(content.id)}
            isPostLiked={isPostLiked}
            isPostDisliked={isPostDisliked}
            bookmarks={this.props.bookmarks}
            toggleBookmark={this.props.toggleBookmark}
          />
        }

        { (!modal && content.author) &&
          <PostSinglePage
            content={content}
            reblog={() => reblog(content.id)}
            isReblogged={reblogList.includes(content.id)}
            openCommentingDraft={openCommentingDraft}
            likePost={() => this.props.likePost(content.id)}
            unlikePost={() => this.props.unlikePost(content.id)}
            dislikePost={() => this.props.dislikePost(content.id)}
            isPostLiked={isPostLiked}
            isPostDisliked={isPostDisliked}
            bookmarks={this.props.bookmarks}
            toggleBookmark={this.props.toggleBookmark}
          />
        }
      </div>
    );
  }
}

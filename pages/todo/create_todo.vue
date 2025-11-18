<template>
	<view class="container">
		
		<view class="flat-item">
			<view class="item-left">
				<image src="https://img.icons8.com/ios/50/666666/edit--v1.png" class="item-icon"></image>
			</view>
			<input class="item-input" v-model="form.name" placeholder="Nhập tên công việc *" />
		</view>

		<view class="editor-container">
			<view class="editor-label-row">
				<view class="item-left">
					<image src="https://img.icons8.com/ios/50/666666/document--v1.png" class="item-icon"></image>
					<text class="label-text">Mô tả</text>
				</view>
			</view>

			<view class="toolbar">
				<view class="tool-row">
					<view class="tool-item" @click="format('bold')" :class="{ 'active': formats.bold }"><text class="txt-icon bold">B</text></view>
					<view class="tool-item" @click="format('italic')" :class="{ 'active': formats.italic }"><text class="txt-icon italic">I</text></view>
					<view class="tool-item" @click="format('underline')" :class="{ 'active': formats.underline }"><text class="txt-icon underline">U</text></view>
					<view class="tool-item" @click="format('strike')" :class="{ 'active': formats.strike }"><text class="txt-icon strike">S</text></view>
					<view class="tool-divider"></view>
					<view class="tool-item" @click="format('list', 'ordered')"><image src="https://img.icons8.com/ios/50/666666/numbered-list.png" class="img-tool"></image></view>
					<view class="tool-item" @click="format('list', 'bullet')"><image src="https://img.icons8.com/ios/50/666666/list.png" class="img-tool"></image></view>
					<picker :range="headerOptions" range-key="label" @change="onHeaderChange" class="tool-picker"><view class="picker-label">{{ currentHeader }} ▾</view></picker>
				</view>
				<view class="tool-row">
					<view class="tool-item" @click="openColorPicker('color')"><text class="txt-icon color-text" :style="{ color: currentColor }">A</text><view class="color-bar" :style="{ backgroundColor: currentColor }"></view></view>
					<view class="tool-item" @click="openColorPicker('backgroundColor')"><text class="txt-icon bg-text" :style="{ backgroundColor: currentBgColor }">A</text></view>
					<view class="tool-divider"></view>
					<view class="tool-item" @click="toggleAlign"><image :src="alignIcon" class="img-tool"></image></view>
					<view class="tool-divider"></view>
					<view class="tool-item" @click="handleLinkBtn" :class="{ 'active': isLinkSelected, 'disabled': !canInsertLink && !isLinkSelected }"><image src="https://img.icons8.com/ios/50/666666/link--v1.png" class="img-tool" :style="{ opacity: (canInsertLink || isLinkSelected) ? 1 : 0.3 }"></image></view>
					<view class="tool-item" @click="insertImage"><image src="https://img.icons8.com/ios/50/666666/image.png" class="img-tool"></image></view>
					<view class="tool-item" @click="insertVideo"><image src="https://img.icons8.com/ios/50/666666/video-call.png" class="img-tool"></image></view>
				</view>
			</view>

			<view class="ql-container static-view" v-if="isPopupOpen">
				<rich-text :nodes="form.desc || '<p style=\'color:#999\'>Nhập mô tả...</p>'"></rich-text>
			</view>
			
			<editor 
				v-else
				id="editor" 
				class="ql-container" 
				placeholder="Nhập mô tả..." 
				:show-img-size="true" 
				:show-img-toolbar="true" 
				:show-img-resize="true"
				@ready="onEditorReady" 
				@input="onEditorInput" 
				@statuschange="onStatusChange">
			</editor>
		</view>

		<view class="flat-item"><view class="item-left"><image src="https://img.icons8.com/ios/50/666666/price-tag.png" class="item-icon"></image></view><input class="item-input" v-model="form.customer" placeholder="Mã khách hàng" /></view>
		<view class="flat-item"><view class="item-left"><image src="https://img.icons8.com/ios/50/666666/user.png" class="item-icon"></image></view><input class="item-input" v-model="form.assignee" placeholder="ID người nhận" /></view>
		
		<view class="flat-item date-compound-block">
			<view class="item-left icon-top-aligned">
				<image src="https://img.icons8.com/ios/50/666666/time.png" class="item-icon"></image>
			</view>
			<view class="right-column">
				
				<view class="date-row">
					<picker mode="date" :value="form.dueDate" @change="bindDateChange($event, 'dueDate')" class="full-width-picker">
						<view class="item-picker" :class="{ 'placeholder-color': !form.dueDate }">
							<text class="picker-label">Hết hạn:</text> {{ form.dueDate ? formatDateDisplay(form.dueDate) : 'Chọn ngày' }}
						</view>
					</picker>
				</view>

				<view class="inner-divider"></view>

				<view class="date-row split-row">
					<picker mode="date" :value="form.notifyDate" @change="bindDateChange($event, 'notifyDate')" class="half-picker">
						<view class="item-picker" :class="{ 'placeholder-color': !form.notifyDate }">
							<text class="picker-label">Thông báo:</text> {{ form.notifyDate ? formatDateDisplay(form.notifyDate) : 'Ngày' }}
						</view>
					</picker>

					<view class="vertical-divider"></view>

					<picker mode="time" :value="form.notifyTime" @change="bindDateChange($event, 'notifyTime')" class="half-picker">
						<view class="item-picker" :class="{ 'placeholder-color': !form.notifyTime }">
							{{ form.notifyTime ? form.notifyTime : 'Giờ' }}
						</view>
					</picker>
				</view>

			</view>
		</view>

		<view class="footer-action">
			<button class="btn btn-cancel" @click="goBack">Hủy bỏ</button>
			<button class="btn btn-submit" :disabled="loading" @click="submitForm">{{ loading ? 'Đang lưu...' : 'Lưu công việc' }}</button>
		</view>

		<view class="color-popup-overlay" v-if="showColorPopup" @click="closeColorPopup">
			<view class="color-popup" @click.stop>
				<text class="popup-title">Chọn màu</text>
				<view class="color-grid">
					<view v-for="c in colorList" :key="c" class="color-cell" :style="{ backgroundColor: c }" @click="selectColor(c)"></view>
					<view class="color-cell remove-color" @click="selectColor(null)">✕</view>
				</view>
			</view>
		</view>

		<view class="link-popup-overlay" v-if="showLinkPopup" @click="closeLinkPopup">
			<view class="link-popup" @click.stop>
				<text class="popup-title">{{ isLinkSelected ? 'Chỉnh sửa liên kết' : 'Chèn liên kết' }}</text>
				
				<view class="input-group">
					<text class="input-label">Văn bản hiển thị:</text>
					<input class="link-input" v-model="linkText" placeholder="Nhập văn bản..." />
				</view>
				
				<view class="input-group">
					<text class="input-label">Đường dẫn (URL):</text>
					<input class="link-input" v-model="linkUrl" placeholder="https://" :focus="focusLinkInput" />
				</view>
				
				<view class="link-actions">
					<button v-if="isLinkSelected" class="link-btn remove" @click="removeLink">Gỡ Link</button>
					<button class="link-btn cancel" @click="closeLinkPopup">{{ isLinkSelected ? 'Hủy' : 'Thoát' }}</button>
					<button class="link-btn confirm" @click="confirmLink">Lưu</button>
				</view>
			</view>
		</view>

	</view>
</template>

<script setup>
	import { useCreateTodoController } from '@/controllers/create_todo.js';

	const {
		loading, form,
		formatDateDisplay, bindDateChange, goBack, submitForm,
		formats, showLinkPopup, linkUrl, linkText, canInsertLink, isLinkSelected,
		focusLinkInput, showColorPopup, currentColor, currentBgColor, currentHeader,
		colorList, headerOptions, alignIcon, isPopupOpen,
		onEditorReady, onEditorInput, onStatusChange, handleLinkBtn, closeLinkPopup,
		confirmLink, removeLink, format, onHeaderChange, toggleAlign, openColorPicker,
		closeColorPopup, selectColor, insertImage, insertVideo
	} = useCreateTodoController();
</script>

<style lang="scss">
	.container { min-height: 100vh; background-color: #f5f5f7; padding: 15px; box-sizing: border-box; }
	.flat-item { background-color: #fff; margin-bottom: 12px; padding: 15px; display: flex; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
	.item-left { display: flex; align-items: center; margin-right: 15px; }
	.icon-top-aligned { align-self: flex-start; margin-top: 2px; }
	.item-icon { width: 22px; height: 22px; opacity: 0.6; }
	.item-input { flex: 1; text-align: left; font-size: 15px; color: #333; }
	.editor-container { background-color: #fff; margin-bottom: 12px; padding: 15px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); display: flex; flex-direction: column; }
	.editor-label-row { display: flex; align-items: center; margin-bottom: 8px; }
	.label-text { font-size: 15px; color: #666; }
	.toolbar { background-color: #f9f9fa; border: 1px solid #e0e0e0; border-radius: 4px; padding: 5px; margin-bottom: 10px; }
	.tool-row { display: flex; align-items: center; flex-wrap: wrap; padding: 4px 0; }
	.tool-row:first-child { border-bottom: 1px solid #f0f0f0; margin-bottom: 4px; padding-bottom: 8px; }
	.tool-item { width: 34px; height: 34px; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-right: 2px; border-radius: 4px; position: relative; }
	.tool-item:active, .tool-item.active { background-color: #e6e6e6; }
	.tool-item.disabled { opacity: 0.5; pointer-events: none; }
	.txt-icon { font-size: 16px; color: #333; font-weight: 500; font-family: serif; }
	.bold { font-weight: 900; } .italic { font-style: italic; } .underline { text-decoration: underline; } .strike { text-decoration: line-through; }
	.img-tool { width: 18px; height: 18px; opacity: 0.8; }
	.tool-divider { width: 1px; height: 18px; background-color: #ccc; margin: 0 6px; }
	.color-text { font-weight: bold; }
	.color-bar { width: 14px; height: 3px; margin-top: -2px; border-radius: 1px; }
	.bg-text { padding: 0 4px; border-radius: 2px; font-size: 14px; border: 1px solid #ddd; }
	.tool-picker { margin-left: auto; background-color: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 2px 8px; height: 24px; display: flex; align-items: center; }
	.picker-label { font-size: 12px; color: #333; }
	.ql-container { min-height: 120px; width: 100%; font-size: 15px; line-height: 1.6; color: #333; }
	.static-view { padding: 10px 0; border-top: 1px solid #eee; color: #333; min-height: 120px; overflow-y: auto; }
	.color-popup-overlay, .link-popup-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.4); z-index: 9999; display: flex; justify-content: center; align-items: center; }
	.color-popup, .link-popup { background-color: #fff; width: 85%; border-radius: 12px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); animation: popIn 0.2s ease-out; }
	@keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
	.popup-title { font-size: 16px; font-weight: bold; margin-bottom: 15px; display: block; text-align: center; color: #333; }
	.color-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
	.color-cell { width: 30px; height: 30px; border-radius: 4px; border: 1px solid #eee; }
	.remove-color { display: flex; align-items: center; justify-content: center; background-color: #fff; color: #ff0000; font-size: 18px; font-weight: bold; border: 1px solid #ccc; }
	.input-group { margin-bottom: 15px; }
	.input-label { font-size: 13px; color: #666; margin-bottom: 5px; display: block; font-weight: 500; }
	.link-input { width: 100%; border: 1px solid #ddd; padding: 10px; border-radius: 6px; font-size: 15px; box-sizing: border-box; outline: none; }
	.link-input:focus { border-color: #007aff; }
	.link-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 5px; }
	.link-btn { font-size: 14px; height: 36px; line-height: 36px; padding: 0 15px; border-radius: 4px; border: none; margin: 0; }
	.link-btn.cancel { background-color: #f0f0f0; color: #333; }
	.link-btn.remove { background-color: #fff; color: #ff3b30; border: 1px solid #ff3b30; margin-right: auto; }
	.link-btn.confirm { background-color: #007aff; color: #fff; }
	
	/* Styles cho Date Picker */
	.date-compound-block { align-items: flex-start; } .right-column { flex: 1; display: flex; flex-direction: column; }
	.date-row { width: 100%; height: 30px; display: flex; align-items: center; } .full-width-picker { width: 100%; }
	.item-picker { text-align: left; font-size: 15px; color: #333; width: 100%; display: flex; align-items: center; } 
	.placeholder-color { color: #808080; }
	.picker-label { font-weight: bold; color: #666; margin-right: 6px; font-size: 14px; }
	.inner-divider { height: 1px; background-color: #f0f0f0; margin: 10px 0; width: 100%; }
	
	/* Split Row cho Ngày + Giờ */
	.split-row { justify-content: space-between; }
	.half-picker { flex: 1; }
	.vertical-divider { width: 1px; height: 18px; background-color: #ccc; margin: 0 10px; }

	.footer-action { margin-top: 30px; display: flex; justify-content: space-between; }
	.btn { border-radius: 0; font-size: 15px; font-weight: bold; height: 45px; line-height: 45px; border: none; }
	.btn-cancel { width: 35%; background-color: #e5e5ea; color: #333; } .btn-submit { width: 60%; background-color: #007aff; color: #fff; }
	.btn-submit[disabled] { background-color: #8dc2ff; }
</style>